/**
 * `create-media-from-url-stream` — passthrough upload from a public URL into
 * Umbraco's TempFile endpoint, intended for files in the few-MB range where
 * the default `create-media` URL path times out on the hosted Worker.
 *
 * Why a new tool rather than fixing `create-media`?
 *   - `create-media` goes through the orval-generated `postTemporaryFile`
 *     wrapper, which serialises via `FormData(Blob([Uint8Array(Buffer(...))]))`.
 *     That's three full copies of the file in worker memory before `fetch`
 *     even sees it, plus the entire response is read into a `Buffer` first
 *     (`await response.arrayBuffer()`). For ~3 MB files this combination
 *     blows past the MCP transport's ~30s wall-clock and surfaces as
 *     `TimeoutError:` on the client.
 *   - This tool bypasses the orval client entirely and pipes the source
 *     `response.body` straight into a custom multipart `ReadableStream`
 *     consumed by `fetch`. CPU usage stays near zero; download and upload
 *     happen concurrently, so wall-clock collapses from `download + upload`
 *     to roughly `max(download, upload)`.
 *
 * Why registered in `worker.ts` rather than a regular collection?
 *   - We need direct access to the per-tenant Umbraco base URL and the
 *     KV-stored OAuth token to fetch outside the SDK transport. The hosted
 *     SDK already resolves both during `createPerRequestServer`; we
 *     duplicate that resolution here using exports from the hosted package.
 *   - As with `create-media-from-file`, the SDK's collection-registration
 *     loop currently doesn't forward extras like `_meta`, so direct
 *     registration on the `McpServer` is the simplest unblocking path.
 */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import {
  getStoredUmbracoToken,
  type HostedMcpEnv,
} from "@umbraco-cms/mcp-hosted";
import {
  CAPTURE_RAW_HTTP_RESPONSE,
  MEDIA_TYPE_ARTICLE,
  MEDIA_TYPE_AUDIO,
  MEDIA_TYPE_FILE,
  MEDIA_TYPE_IMAGE,
  MEDIA_TYPE_VECTOR_GRAPHICS,
  MEDIA_TYPE_VIDEO,
} from "@umbraco-cms/mcp-server-sdk";
import { UmbracoManagementClient } from "../../../umbraco-management-client.js";
import {
  buildValueStructure,
  fetchMediaTypeId,
  validateMediaTypeForSvg,
} from "./helpers/media-upload-helpers.js";

// MCP tool handlers don't receive the worker env / auth props. Stash what we
// need during `init()` and read it back here. Safe because a Durable Object
// processes one request at a time, so this module-level slot is per-DO.
type StreamingAuthContext = {
  env: HostedMcpEnv;
  tokenKey: string;
};

let authContext: StreamingAuthContext | null = null;

/** Called from `worker.ts` immediately after `createPerRequestServer`. */
export function setStreamingAuthContext(ctx: StreamingAuthContext): void {
  authContext = ctx;
}

const inputShape = {
  fileUrl: z
    .string()
    .url()
    .describe(
      "Public, direct-download URL of the file to upload. Same constraints as create-media's fileUrl — share/viewer links must be converted first."
    ),
  name: z
    .string()
    .describe("The name of the media item (include extension if it isn't in the URL)"),
  mediaTypeName: z
    .string()
    .describe(
      `Media type: '${MEDIA_TYPE_IMAGE}', '${MEDIA_TYPE_ARTICLE}', '${MEDIA_TYPE_AUDIO}', '${MEDIA_TYPE_VIDEO}', '${MEDIA_TYPE_VECTOR_GRAPHICS}', '${MEDIA_TYPE_FILE}', or a custom media type name`
    ),
  parentId: z.string().uuid().optional().describe("Parent folder ID (defaults to root)"),
};

const outputShape = {
  message: z.string(),
  name: z.string(),
  id: z.string().uuid(),
};

/**
 * Reads the fresh OAuth token + resolved per-tenant base URL from KV.
 * Site-specific URLs override the env-level defaults — same precedence the
 * hosted SDK uses in `createFetchClientFromKV`.
 */
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
 * 500s if it's missing. If the caller didn't supply one, fall back to the
 * URL path's extension and finally to the response Content-Type.
 */
function ensureExtension(name: string, contentType: string | null, urlPath: string): string {
  if (name.includes(".")) return name;
  const fromUrl = urlPath.match(/\.([a-z0-9]{1,8})$/i)?.[0];
  if (fromUrl) return `${name}${fromUrl}`;
  if (contentType) {
    const subtype = contentType.split(";")[0].split("/")[1];
    if (subtype && /^[a-z0-9]{1,8}$/i.test(subtype)) {
      // image/jpeg → .jpg (Umbraco's allowed list uses .jpg, not .jpeg)
      return `${name}.${subtype === "jpeg" ? "jpg" : subtype}`;
    }
  }
  return `${name}.bin`;
}

export function registerCreateMediaFromUrlStreamTool(server: McpServer): void {
  server.registerTool(
    "create-media-from-url-stream",
    {
      description:
        "Upload a media file to Umbraco from a public URL by streaming the bytes straight through the worker (Drive/Dropbox/etc -> Umbraco) without buffering. " +
        "Prefer this over `create-media` (sourceType=url) when the file is more than ~1 MB — it avoids the worker invocation timeout that bites that path for files in the few-MB range. " +
        "Same URL constraints as create-media: must be a direct-download URL with no auth (share/viewer links must be transformed first; e.g. Google Drive: drive.google.com/uc?export=download&id=<id>).",
      inputSchema: inputShape,
      outputSchema: outputShape,
      annotations: { title: "Create media from URL (streaming)" },
    },
    async (model) => {
      try {
        const client = UmbracoManagementClient.getClient();

        // Warm up the OAuth token before reading it from KV.
        //
        // We bypass the SDK transport for the streaming POST below, which
        // means we can't rely on its built-in refresh-on-401 retry. Issuing
        // any cheap SDK call here gives the transport a chance to refresh
        // (and write the new token back into KV) so the access token we
        // then pull from KV is current. The warmup is allowed to fail —
        // genuinely-broken auth surfaces a clearer error from `resolveAuth`
        // below.
        try {
          await client.getTemporaryFileConfiguration();
        } catch (warmupErr) {
          console.log("[stream] token warmup failed:", (warmupErr as Error).message);
        }

        const { accessToken, baseUrl } = await resolveAuth();

        // SVG quirk: the Image media type can't hold an SVG, so route those
        // to Vector Graphics automatically (same auto-correction the
        // standard URL path does).
        const validatedMediaTypeName = validateMediaTypeForSvg(
          undefined,
          model.fileUrl,
          model.name,
          model.mediaTypeName
        );
        const mediaTypeId = await fetchMediaTypeId(client, validatedMediaTypeName);

        // 1. Open the source as a streaming response. 30s safety timeout in
        //    case the remote stalls — Drive/Dropbox both honour normal HTTP
        //    so this should never fire for healthy fetches.
        const sourceController = new AbortController();
        const sourceTimeout = setTimeout(() => sourceController.abort(), 30_000);
        let sourceResp: Response;
        try {
          sourceResp = await fetch(model.fileUrl, { signal: sourceController.signal });
        } finally {
          clearTimeout(sourceTimeout);
        }
        if (!sourceResp.ok || !sourceResp.body) {
          throw new Error(
            `Failed to fetch source URL: HTTP ${sourceResp.status} ${sourceResp.statusText}`
          );
        }
        const sourceContentType =
          sourceResp.headers.get("content-type") ?? "application/octet-stream";
        const filename = ensureExtension(
          model.name,
          sourceContentType,
          new URL(model.fileUrl).pathname
        );

        // 2. Construct a multipart/form-data body as a ReadableStream.
        //
        //    Web FormData / Blob would force us to materialise the full file
        //    into memory first. By hand-rolling the multipart envelope and
        //    yielding chunks straight from `sourceResp.body`, the worker
        //    never holds more than one network-sized chunk at a time. The
        //    Drive download and the Umbraco upload then run concurrently
        //    (consumer pulls from us as fast as we can pull from Drive),
        //    which is the actual win for wall-clock.
        const temporaryFileId = uuidv4();
        const boundary = `----mcp-stream-${crypto.randomUUID()}`;
        const encoder = new TextEncoder();
        const prefix = encoder.encode(
          `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="Id"\r\n\r\n` +
            `${temporaryFileId}\r\n` +
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="File"; filename="${filename}"\r\n` +
            `Content-Type: ${sourceContentType}\r\n\r\n`
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

        // 3. POST the stream to Umbraco's TempFile endpoint.
        //
        //    `duplex: "half"` is mandatory whenever the request body is a
        //    `ReadableStream` (Fetch spec / undici / workerd all enforce
        //    this). Without it, the runtime refuses to send the request.
        //    The `@ts-expect-error` is because lib.dom.d.ts hasn't shipped
        //    the `duplex` property yet.
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
            `Umbraco temporary-file POST failed: HTTP ${tempResp.status} ${tempResp.statusText} - ${errBody}`
          );
        }

        // 4. Create the media item itself. Small JSON request — back through
        //    the regular SDK client now that the bytes have already landed
        //    in Umbraco's temp store.
        const valueStructure = buildValueStructure(validatedMediaTypeName, temporaryFileId);
        const response = (await client.postMedia(
          {
            mediaType: { id: mediaTypeId },
            variants: [{ culture: null, segment: null, name: model.name }],
            values: [valueStructure] as any,
            parent: model.parentId ? { id: model.parentId } : null,
          },
          CAPTURE_RAW_HTTP_RESPONSE
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
            `Could not extract media id from Location header: ${locationHeader ?? "(missing)"}`
          );
        }
        const mediaId = idMatch[1];

        const structured = {
          message: `Media "${model.name}" created successfully`,
          name: model.name,
          id: mediaId,
        };
        return {
          content: [{ type: "text" as const, text: JSON.stringify(structured) }],
          structuredContent: structured,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error creating media: ${(error as Error).message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
