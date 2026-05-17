/**
 * Streaming source URL -> Umbraco TempFile -> created media item.
 *
 * Used by `create-media` when sourceType is `url` or `file`. Pipes the source
 * `response.body` straight into a custom multipart `ReadableStream` POST to
 * Umbraco's temporary-file endpoint with `duplex: "half"`, so the source
 * download and the Umbraco upload run concurrently. No file bytes ever land
 * in a `Buffer`/`Uint8Array` on this side.
 *
 * Bypasses the orval-generated `postTemporaryFile` wrapper (which buffers via
 * FormData/Blob and trips the MCP transport's ~30s wall-clock for files in
 * the few-MB range). The follow-up `postMedia` request is small JSON and goes
 * back through the regular SDK client.
 */
import { v4 as uuidv4 } from "uuid";
import {
  getStoredUmbracoToken,
  type HostedMcpEnv,
} from "@umbraco-cms/mcp-hosted";
import { CAPTURE_RAW_HTTP_RESPONSE } from "@umbraco-cms/mcp-server-sdk";
import { UmbracoManagementClient } from "../../../../umbraco-management-client.js";
import {
  buildValueStructure,
  fetchMediaTypeId,
  validateMediaTypeForSvg,
} from "./media-upload-helpers.js";

// MCP tool handlers don't receive worker env/auth props. Stash what we need
// during `init()` in worker.ts and read it back from here. A Durable Object
// processes one request at a time, so this module-level slot is per-DO.
type StreamingAuthContext = { env: HostedMcpEnv; tokenKey: string };
let authContext: StreamingAuthContext | null = null;

/** Called from `worker.ts` immediately after `createPerRequestServer`. */
export function setStreamingAuthContext(ctx: StreamingAuthContext): void {
  authContext = ctx;
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
  return { accessToken: entry.tokens.access_token, baseUrl };
}

/**
 * Umbraco's TempFile service parses the extension off the upload filename and
 * 500s if it's missing. Fall back to URL path → Content-Type if the caller
 * didn't supply one.
 */
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

/**
 * Stream a public URL straight into Umbraco's TempFile endpoint, then create
 * the media item. Returns `{name, id}` of the created media.
 */
export async function streamingUploadFromUrl(
  params: StreamingUploadParams,
): Promise<StreamingUploadResult> {
  const client = UmbracoManagementClient.getClient();

  // Warm up the OAuth token before reading it from KV. We bypass the SDK
  // transport for the streaming POST below, so we can't rely on its built-in
  // refresh-on-401 retry. A cheap SDK call here gives the transport a chance
  // to refresh (and write the new token back into KV) so the access token we
  // pull from KV next is current. Genuine auth failures surface a clearer
  // error from `resolveAuth`, so we swallow the warmup error here.
  try {
    await client.getTemporaryFileConfiguration();
  } catch {
    // intentionally ignored — see comment above
  }

  const { accessToken, baseUrl } = await resolveAuth();

  // SVG quirk: the Image media type can't hold an SVG, so route those to
  // Vector Graphics automatically (same behaviour as the buffered URL path).
  const validatedMediaTypeName = validateMediaTypeForSvg(
    undefined,
    params.sourceUrl,
    params.name,
    params.mediaTypeName,
  );
  const mediaTypeId = await fetchMediaTypeId(client, validatedMediaTypeName);

  // 1. Open the source as a streaming response. 30s safety timeout in case
  //    the remote stalls — Drive/Dropbox/etc. honour normal HTTP, so this
  //    should never fire for healthy fetches.
  const sourceController = new AbortController();
  const sourceTimeout = setTimeout(() => sourceController.abort(), 30_000);
  let sourceResp: Response;
  try {
    sourceResp = await fetch(params.sourceUrl, { signal: sourceController.signal });
  } finally {
    clearTimeout(sourceTimeout);
  }
  if (!sourceResp.ok || !sourceResp.body) {
    throw new Error(
      `Failed to fetch source URL: HTTP ${sourceResp.status} ${sourceResp.statusText}`,
    );
  }
  const sourceContentType = sourceResp.headers.get("content-type") ?? "application/octet-stream";
  const filename = ensureExtension(
    params.name,
    sourceContentType,
    new URL(params.sourceUrl).pathname,
  );

  // 2. Build the multipart/form-data body as a ReadableStream. Web FormData
  //    + Blob would force the full payload into memory first; by hand-rolling
  //    the envelope and yielding source chunks directly we avoid that — the
  //    worker holds at most one network-sized chunk at a time, and the Drive
  //    download + Umbraco upload run concurrently.
  const temporaryFileId = uuidv4();
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
      controller.enqueue(prefix);
      const reader = sourceBody.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) controller.enqueue(value);
        }
        controller.enqueue(suffix);
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });

  // 3. POST the stream to Umbraco's TempFile endpoint. `duplex: "half"` is
  //    mandatory whenever the request body is a `ReadableStream` (Fetch spec
  //    / undici / workerd all enforce this); without it the runtime refuses
  //    to send the request. The `@ts-expect-error` is because lib.dom.d.ts
  //    hasn't shipped the `duplex` property yet.
  const tempUrl = `${baseUrl.replace(/\/$/, "")}/umbraco/management/api/v1/temporary-file`;
  const tempResp = await fetch(tempUrl, {
    method: "POST",
    body: multipartBody,
    // @ts-expect-error — `duplex` is required by Workers/undici for streaming bodies
    duplex: "half",
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

  // 4. Create the media item — small JSON request, back through the regular
  //    SDK client now that the bytes have already landed in Umbraco's temp
  //    store.
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
  // The created media's id is only available via the Location header
  // (`/umbraco/management/api/v1/media/<guid>`), per REST convention.
  const locationHeader = response.headers?.location ?? response.headers?.Location;
  const idMatch = locationHeader?.match(/\/([a-f0-9-]{36})$/i);
  if (!idMatch) {
    throw new Error(
      `Could not extract media id from Location header: ${locationHeader ?? "(missing)"}`,
    );
  }
  return { name: params.name, id: idMatch[1] };
}
