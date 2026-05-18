import {
  getStoredUmbracoToken,
  type HostedMcpEnv,
} from "@umbraco-cms/mcp-hosted";
import {
  CAPTURE_RAW_HTTP_RESPONSE,
  createToolResult,
  createToolResultError,
  normalizeBaseUrl,
} from "@umbraco-cms/mcp-server-sdk";
import { UmbracoManagementClient } from "../../../../umbraco-management-client.js";
import {
  buildValueStructure,
  fetchMediaTypeId,
  validateMediaTypeForSvg,
} from "./media-upload-helpers.js";

// Tool handlers don't receive env/props, and the streaming POST must bypass
// the orval transport to use `duplex: "half"`. Worker init stashes the auth
// material here; the DO model means there's one active request per isolate
// per moment, so the module-level slot is safe.
type StreamingAuthContext = { env: HostedMcpEnv; tokenKey: string };
let authContext: StreamingAuthContext | null = null;

export function setStreamingAuthContext(ctx: StreamingAuthContext): void {
  authContext = ctx;
}

export function isStreamingAuthContextConfigured(): boolean {
  return authContext !== null;
}

async function resolveAuth(): Promise<{ accessToken: string; baseUrl: string }> {
  if (!authContext) {
    throw new Error(
      "Streaming auth context not configured. setStreamingAuthContext() must be called in worker init()."
    );
  }
  const entry = await getStoredUmbracoToken(authContext.env.OAUTH_KV, authContext.tokenKey);
  if (!entry?.tokens?.access_token) {
    throw new Error("No Umbraco access token in KV. Reconnect the MCP connector.");
  }
  const baseUrl =
    entry.site?.serverUrl ??
    entry.site?.baseUrl ??
    authContext.env.UMBRACO_SERVER_URL ??
    authContext.env.UMBRACO_BASE_URL;
  if (!baseUrl) {
    throw new Error("No Umbraco base URL resolvable from site or env.");
  }
  return { accessToken: entry.tokens.access_token, baseUrl: normalizeBaseUrl(baseUrl) };
}

// Umbraco's TempFile service parses the extension off the upload filename and
// 500s if it's missing. Fall back to URL path → Content-Type subtype.
function ensureExtension(name: string, contentType: string | null, urlPath: string): string {
  if (name.includes(".")) return name;
  const fromUrl = urlPath.match(/\.([a-z0-9]{1,8})$/i)?.[0];
  if (fromUrl) return `${name}${fromUrl}`;
  if (contentType) {
    const subtype = contentType.split(";")[0].split("/")[1];
    if (subtype && /^[a-z0-9]{1,8}$/i.test(subtype)) {
      // Umbraco's allowed-extension list uses `.jpg`, not `.jpeg`.
      return `${name}.${subtype === "jpeg" ? "jpg" : subtype}`;
    }
  }
  return `${name}.bin`;
}

export type StreamingUploadParams = {
  sourceUrl: string;
  name: string;
  mediaTypeName: string;
  parentId?: string;
};

export type StreamingUploadResult = {
  name: string;
  id: string;
};

export async function streamingUploadFromUrl(
  params: StreamingUploadParams,
): Promise<StreamingUploadResult> {
  const client = UmbracoManagementClient.getClient();

  // Run prelude concurrently: SVG → media-type id, KV token read, and a
  // cheap SDK call that gives the transport a chance to refresh the OAuth
  // token before we read it directly from KV (we bypass the SDK transport
  // for the streaming POST, so we lose its refresh-on-401 retry). Warmup
  // errors don't abort — `resolveAuth` will produce a clearer message.
  const validatedMediaTypeName = validateMediaTypeForSvg(
    undefined,
    params.sourceUrl,
    params.name,
    params.mediaTypeName,
  );
  const [mediaTypeId, auth] = await Promise.all([
    fetchMediaTypeId(client, validatedMediaTypeName),
    (async () => {
      await client.getTemporaryFileConfiguration().catch(() => undefined);
      return resolveAuth();
    })(),
  ]);
  const { accessToken, baseUrl } = auth;

  // One AbortController covers the whole pipeline: source fetch headers,
  // body stream, and Umbraco POST. A downstream failure (or the 60s overall
  // deadline) cancels the source download so we don't drain bytes into the
  // void. The deadline is wider than the MCP transport's ~30s wall-clock —
  // by the time we'd hit it, the client has already given up.
  const ctl = new AbortController();
  const overallTimeout = setTimeout(() => ctl.abort(), 60_000);
  try {
    const sourceResp = await fetch(params.sourceUrl, { signal: ctl.signal });
    if (!sourceResp.ok || !sourceResp.body) {
      throw new Error(
        `Failed to fetch source URL: HTTP ${sourceResp.status} ${sourceResp.statusText}`,
      );
    }
    const sourceContentType = sourceResp.headers.get("content-type") ?? "application/octet-stream";
    const sourceUrl = new URL(params.sourceUrl);
    const filename = ensureExtension(params.name, sourceContentType, sourceUrl.pathname);

    // Hand-roll multipart so we can yield chunks straight from the source
    // body. Web FormData + Blob would force a full buffer in memory; this
    // way the worker holds one network-sized chunk at a time and source
    // download + Umbraco upload run concurrently.
    const temporaryFileId = crypto.randomUUID();
    const boundary = `----mcp-stream-${crypto.randomUUID()}`;
    const encoder = new TextEncoder();
    const prefix = encoder.encode(
      `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="Id"\r\n\r\n` +
        `${temporaryFileId}\r\n` +
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="File"; filename="${filename}"\r\n` +
        `Content-Type: ${sourceContentType}\r\n\r\n`,
    );
    const suffix = encoder.encode(`\r\n--${boundary}--\r\n`);

    const sourceBody = sourceResp.body;
    const multipartBody = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = sourceBody.getReader();
        try {
          controller.enqueue(prefix);
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) controller.enqueue(value);
          }
          controller.enqueue(suffix);
          controller.close();
        } catch (e) {
          controller.error(e);
        } finally {
          reader.releaseLock();
        }
      },
      cancel(reason) {
        // Downstream gave up (Umbraco rejected / `ctl.abort()` fired) —
        // cancel the upstream so we stop draining bytes from Drive/etc.
        sourceBody.cancel(reason).catch(() => undefined);
      },
    });

    // `duplex: "half"` is mandatory whenever the fetch body is a
    // ReadableStream; lib.dom.d.ts hasn't shipped the property yet.
    const tempResp = await fetch(`${baseUrl}/umbraco/management/api/v1/temporary-file`, {
      method: "POST",
      body: multipartBody,
      // @ts-expect-error — `duplex` is required by Workers/undici for streaming bodies
      duplex: "half",
      signal: ctl.signal,
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });
    if (!tempResp.ok) {
      const errBody = await tempResp.text().catch(() => "");
      throw new Error(
        `Umbraco temporary-file POST failed: HTTP ${tempResp.status} ${tempResp.statusText} - ${errBody}`,
      );
    }

    const valueStructure = buildValueStructure(validatedMediaTypeName, temporaryFileId);
    const response = (await client.postMedia(
      {
        mediaType: { id: mediaTypeId },
        variants: [{ culture: null, segment: null, name: params.name }],
        values: [valueStructure] as any,
        parent: params.parentId ? { id: params.parentId } : null,
      },
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as any;

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`postMedia failed with status ${response.status}`);
    }
    // Created media id is only on the Location header
    // (`/umbraco/management/api/v1/media/<guid>`).
    const locationHeader = response.headers?.location ?? response.headers?.Location;
    const idMatch = locationHeader?.match(/\/([a-f0-9-]{36})$/i);
    if (!idMatch) {
      throw new Error(
        `Could not extract media id from Location header: ${locationHeader ?? "(missing)"}`,
      );
    }
    return { name: params.name, id: idMatch[1] };
  } finally {
    clearTimeout(overallTimeout);
  }
}

/** Streaming upload + standard tool-result wrapping. Used by `create-media` for
 *  both sourceType="url" (public direct-download URL) and sourceType="file"
 *  (host-injected download_url via `openai/fileParams`). */
export async function streamingUploadToToolResult(params: StreamingUploadParams) {
  try {
    const { name, id } = await streamingUploadFromUrl(params);
    return createToolResult({
      message: `Media "${name}" created successfully`,
      name,
      id,
    });
  } catch (error) {
    return createToolResultError({
      detail: `Error creating media: ${(error as Error).message}`,
    });
  }
}

