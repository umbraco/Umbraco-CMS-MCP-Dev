import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { uploadMediaFile } from "./helpers/media-upload-helpers.js";
import { buildSourceTypeSection } from "./helpers/source-type-helpers.js";
import {
  isStreamingAuthContextConfigured,
  streamingUploadFromUrl,
} from "./helpers/streaming-upload.js";
import {
  type ToolDefinition,
  createToolResult,
  createToolResultError,
  MEDIA_TYPE_ARTICLE,
  MEDIA_TYPE_AUDIO,
  MEDIA_TYPE_FILE,
  MEDIA_TYPE_IMAGE,
  MEDIA_TYPE_VECTOR_GRAPHICS,
  MEDIA_TYPE_VIDEO,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

export const createMediaMultipleOutputSchema = z.object({
  summary: z.string(),
  results: z.array(z.object({
    success: z.boolean(),
    name: z.string(),
    id: z.string().guid().optional(),
    error: z.string().optional()
  }))
});

interface UploadResult {
  success: boolean;
  name: string;
  id?: string;
  error?: string;
}

// Marked `[raw]` so withInputSanitization passes the host-injected object
// through verbatim — the wire format is ChatGPT's contract.
const fileObjectSchema = z.object({
  download_url: z.string().describe("Temporary URL the host provides to fetch the file bytes"),
  file_id: z.string().describe("Persistent file identifier from the host"),
  mime_type: z.string().optional().describe("MIME type if the host knows it"),
  file_name: z.string().optional().describe("Original file name if the host knows it"),
});

/** Wall-clock vs Worker subrequest budget. CF Workers cap subrequests at 50
 *  per invocation; at 2 subrequests per slot (source download + Umbraco
 *  upload) this leaves comfortable headroom. */
const UPLOAD_CONCURRENCY = 4;

const MAX_BATCH_SIZE = 20;

/** Runs an async producer over `items` with up to `concurrency` in flight,
 *  preserving input order in the returned results array. */
async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  producer: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;
  async function worker(): Promise<void> {
    while (true) {
      const current = nextIndex++;
      if (current >= items.length) return;
      results[current] = await producer(items[current], current);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export function createCreateMediaMultipleTool(options: { allowFilePath: boolean }) {
  const sourceTypeValues = options.allowFilePath
    ? (["filePath", "url", "file"] as const)
    : (["url", "file"] as const);

  const filePathPrefix = options.allowFilePath ? "'filePath' for local files (most efficient, Node stdio only), " : "";
  const sourceTypeDescription =
    `Media source type: ${filePathPrefix}'url' for public direct-download URLs (streamed), ` +
    `'file' for host-injected attachments — the connector populates each entry's 'file' object automatically when the user attached or generated files in this chat. ` +
    "Base64 is not supported for batch uploads due to token usage — use single-file create-media for tiny inline payloads.";

  const schema = z.object({
    sourceType: z.enum(sourceTypeValues).describe(sourceTypeDescription),
    files: z.array(z.object({
      name: z.string().describe("The name of the media item"),
      filePath: z.string().optional().describe("Absolute path to the file (required if sourceType is 'filePath')"),
      fileUrl: z.string().url().optional().describe("[raw] Public direct-download URL (required if sourceType is 'url'). Drive / Dropbox share links must be converted to their direct-download equivalent first — see the create-media tool description for the format. Streamed, so multi-MB files round-trip without timing out."),
      file: fileObjectSchema.optional().describe("[raw] Host-injected file reference (required if sourceType is 'file'). ChatGPT's connector populates this per entry automatically when files are attached."),
      mediaTypeName: z.string().optional().describe(`Optional override: '${MEDIA_TYPE_IMAGE}', '${MEDIA_TYPE_ARTICLE}', '${MEDIA_TYPE_AUDIO}', '${MEDIA_TYPE_VIDEO}', '${MEDIA_TYPE_VECTOR_GRAPHICS}', '${MEDIA_TYPE_FILE}', or custom media type name. If not specified, defaults to '${MEDIA_TYPE_FILE}'`),
    })).max(MAX_BATCH_SIZE).describe(`Array of files to upload (maximum ${MAX_BATCH_SIZE} files per batch)`),
    parentId: z.string().uuid().optional().describe("Parent folder ID (defaults to root)"),
  });

  type Params = z.infer<typeof schema>;
  type FileEntry = Params["files"][number];

  const filePathSection = buildSourceTypeSection(options.allowFilePath, [
    'url - Stream from any public direct-download URL (Drive / Dropbox / etc.).',
    "file - Stream a host-attached file. The connector injects { download_url, file_id, ... } per entry automatically when the user attached or generated files in this chat — prefer this over 'url' for chat-bound files.",
  ]);

  const tool = {
    name: "create-media-multiple",
    description: `Batch upload multiple media files to Umbraco (maximum ${MAX_BATCH_SIZE} files per batch).

  Use this — not several separate create-media calls — when the user attached or generated multiple files in this chat (sourceType="file"), or has a list of public URLs to upload (sourceType="url"). ChatGPT's connector populates each entry's 'file' field automatically.

  Source Types:
${filePathSection}

  Note: base64 is not supported for batch uploads due to token usage.

  The tool processes up to ${UPLOAD_CONCURRENCY} uploads in parallel and returns detailed results for each file in input order. If some files fail, others continue processing (continue-on-error strategy).`,
    inputSchema: schema.shape,
    outputSchema: createMediaMultipleOutputSchema.shape,
    slices: ['create'],
    _meta: { "openai/fileParams": ["files"] },
    handler: (async (model: Params) => {
      if (model.files.length > MAX_BATCH_SIZE) {
        return createToolResultError({
          detail: `Batch upload limited to ${MAX_BATCH_SIZE} files per call. You provided ${model.files.length} files. Please split into multiple batches.`
        });
      }

      const client = UmbracoManagementClient.getClient();
      const streamingAvailable = isStreamingAuthContextConfigured();

      const results = await mapWithConcurrency<FileEntry, UploadResult>(
        model.files,
        UPLOAD_CONCURRENCY,
        async (file) => {
          try {
            const mediaTypeName = file.mediaTypeName || MEDIA_TYPE_FILE;

            // Host-injected file: resolve to its download_url and stream when
            // we're in hosted mode. Stdio/Jest falls through to the buffered
            // url path below, using the same download_url.
            let effectiveSourceType: "filePath" | "url";
            let effectiveFileUrl = file.fileUrl;
            if (model.sourceType === "file") {
              if (!file.file?.download_url) {
                return {
                  success: false,
                  name: file.name,
                  error:
                    "sourceType is 'file' but no file object was provided for this entry. The host connector should inject this automatically when a file is attached.",
                };
              }
              effectiveSourceType = "url";
              effectiveFileUrl = file.file.download_url;
            } else {
              effectiveSourceType = model.sourceType;
            }

            if (effectiveSourceType === "url" && streamingAvailable) {
              if (!effectiveFileUrl) {
                return {
                  success: false,
                  name: file.name,
                  error: "fileUrl is required when sourceType is 'url'.",
                };
              }
              const { name: actualName, id: mediaId } = await streamingUploadFromUrl({
                sourceUrl: effectiveFileUrl,
                name: file.name,
                mediaTypeName,
                parentId: model.parentId,
              });
              return { success: true, name: actualName, id: mediaId };
            }

            const temporaryFileId = uuidv4();
            const { name: actualName, id: mediaId } = await uploadMediaFile(client, {
              sourceType: effectiveSourceType,
              name: file.name,
              mediaTypeName,
              filePath: file.filePath,
              fileUrl: effectiveFileUrl,
              fileAsBase64: undefined,
              parentId: model.parentId,
              temporaryFileId,
            });
            return { success: true, name: actualName, id: mediaId };
          } catch (error) {
            return { success: false, name: file.name, error: (error as Error).message };
          }
        },
      );

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      return createToolResult({
        summary: `Processed ${model.files.length} files: ${successCount} succeeded, ${failureCount} failed`,
        results
      });
    }),
  } satisfies ToolDefinition<typeof schema.shape, typeof createMediaMultipleOutputSchema.shape>;

  return withStandardDecorators(tool);
}

export default createCreateMediaMultipleTool({ allowFilePath: true });
