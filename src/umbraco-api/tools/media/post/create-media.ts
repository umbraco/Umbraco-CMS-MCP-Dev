import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { BASE64_MAX_BYTES, uploadMediaFile } from "./helpers/media-upload-helpers.js";
import { buildSourceTypeSection } from "./helpers/source-type-helpers.js";
import {
  isStreamingAuthContextConfigured,
  streamingUploadToToolResult,
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

// Shape the host injects for an `openai/fileParams`-declared field. Marked
// `[raw]` so withInputSanitization passes the whole subtree through verbatim —
// the wire format is the host's contract, not ours to validate.
const fileObjectSchema = z.object({
  download_url: z.string().describe("Temporary URL the host provides to fetch the file bytes"),
  file_id: z.string().describe("Persistent file identifier from the host"),
  mime_type: z.string().optional().describe("MIME type if the host knows it"),
  file_name: z.string().optional().describe("Original file name if the host knows it"),
});

export const createMediaOutputSchema = z.object({
  message: z.string(),
  name: z.string(),
  id: z.string().guid()
});

export function createCreateMediaTool(options: { allowFilePath: boolean }) {
  const sourceTypeValues = options.allowFilePath
    ? (["filePath", "url", "file", "base64"] as const)
    : (["url", "file", "base64"] as const);

  const base64Kib = BASE64_MAX_BYTES / 1024;
  const filePathPrefix = options.allowFilePath ? "'filePath' for local files (Node stdio only), " : "";
  const sourceTypeDescription =
    `Media source type: ${filePathPrefix}'url' for public direct-download URLs (streamed; preferred for everything not already attached to the chat), ` +
    `'file' for host-injected attachments — the connector populates the 'file' object automatically when the user attached a file or you generated one in this chat, ` +
    `'base64' for TINY inline payloads only — the server rejects base64 above ${base64Kib} KiB decoded to stop LLM-truncated or thumbnail-preview base64 from persisting as corrupt files`;

  const schema = z.object({
    sourceType: z.enum(sourceTypeValues).describe(sourceTypeDescription),
    name: z.string().describe("The name of the media item"),
    mediaTypeName: z.string().describe(`Media type: '${MEDIA_TYPE_IMAGE}', '${MEDIA_TYPE_ARTICLE}', '${MEDIA_TYPE_AUDIO}', '${MEDIA_TYPE_VIDEO}', '${MEDIA_TYPE_VECTOR_GRAPHICS}', '${MEDIA_TYPE_FILE}', or custom media type name`),
    filePath: z.string().optional().describe("Absolute path to the file (required if sourceType is 'filePath')"),
    fileUrl: z.string().url().optional().describe("[raw] Public, direct-download URL to fetch the file from (required if sourceType is 'url'). Must be reachable without authentication. Share/viewer links (e.g. drive.google.com/file/d/<id>/view, Dropbox ?dl=0, OneDrive view URLs) must be converted to their direct-download equivalent first — Google Drive: drive.google.com/uc?export=download&id=<id>. Uploads are streamed, so multi-MB files round-trip without timing out."),
    file: fileObjectSchema.optional().describe(
      "[raw] Host-injected file object (required if sourceType is 'file'). ChatGPT's connector populates this automatically when the user attached a file or you generated one in this chat — leave it for the host to fill, do not synthesise it yourself."
    ),
    fileAsBase64: z.string().optional().describe(`Base64-encoded file data (required if sourceType is 'base64'). HARD LIMIT: decoded payload must be ≤${base64Kib} KiB; the server rejects anything larger because LLMs reliably truncate big base64 strings or substitute thumbnail previews, both producing corrupt files. Use sourceType='url' or 'file' for everything bigger.`),
    parentId: z.string().uuid().optional().describe("Parent folder ID (defaults to root)"),
  });

  type Params = z.infer<typeof schema>;

  const filePathSection = buildSourceTypeSection(options.allowFilePath, [
    `url - Stream from any public direct-download URL (Drive / Dropbox / etc.). Use this for anything above ${base64Kib} KiB that isn't already attached to the chat.`,
    `file - Stream a host-attached file. The connector injects { download_url, file_id, mime_type, file_name } on the 'file' field automatically when the user attached a file or you generated one in this chat — prefer this over url for chat-bound files.`,
    `base64 - ONLY for tiny inline payloads; server hard-rejects decoded base64 over ${base64Kib} KiB to prevent LLM-truncated corrupt files.`,
  ]);

  const tool = {
    name: "create-media",
    description: `Upload any media file to Umbraco (images, documents, audio, video, SVG, or custom types).

  Pick the sourceType that matches where the file lives:
  - If the file is attached to this chat or you just generated it → sourceType="file" (the host fills in the file reference automatically).
  - If you have a public direct-download URL → sourceType="url".
  - For tiny inline payloads (≤${base64Kib} KiB decoded) → sourceType="base64".

  Media Types:
  - ${MEDIA_TYPE_IMAGE}: jpg, png, gif, webp, etc. (supports cropping)
  - ${MEDIA_TYPE_ARTICLE}: pdf, docx, doc (documents)
  - ${MEDIA_TYPE_AUDIO}: mp3, wav, etc.
  - ${MEDIA_TYPE_VIDEO}: mp4, webm, etc.
  - ${MEDIA_TYPE_VECTOR_GRAPHICS}: svg files only
  - ${MEDIA_TYPE_FILE}: any other file type
  - Custom: any custom media type created in Umbraco

  Source Types:
${filePathSection}

  The tool automatically:
  - Creates temporary files
  - Detects and validates media types (auto-corrects SVG vs Image)
  - Configures correct property editors (ImageCropper vs UploadField)
  - Cleans up temporary files`,
    inputSchema: schema.shape,
    outputSchema: createMediaOutputSchema.shape,
    slices: ['create'],
    _meta: { "openai/fileParams": ["file"] },
    handler: (async (model: Params) => {
      // Resolve "file" → an effective URL early so the rest of the handler
      // sees one of the three supported source types. The host-injected file
      // object always carries a download_url; in hosted (Worker) mode this is
      // streamed, in stdio/Jest it falls through to the buffered url path.
      let effectiveSourceType: "filePath" | "url" | "base64";
      let effectiveFileUrl = model.fileUrl;
      if (model.sourceType === "file") {
        if (!model.file?.download_url) {
          return createToolResultError({
            detail:
              "Error creating media: sourceType is 'file' but no file object was provided. ChatGPT's connector should inject this automatically when a file is attached — if it didn't, the user has nothing attached or your client doesn't support openai/fileParams.",
          });
        }
        effectiveSourceType = "url";
        effectiveFileUrl = model.file.download_url;
      } else {
        effectiveSourceType = model.sourceType;
      }

      // url goes through the streaming helper in hosted (Worker) mode where the
      // auth context is wired up at init; Node stdio + Jest fall through to the
      // buffered orval path below, which handles url/filePath/base64 uniformly.
      if (effectiveSourceType === "url" && isStreamingAuthContextConfigured()) {
        if (!effectiveFileUrl) {
          return createToolResultError({
            detail: "Error creating media: fileUrl is required when sourceType is 'url'",
          });
        }
        return streamingUploadToToolResult({
          sourceUrl: effectiveFileUrl,
          name: model.name,
          mediaTypeName: model.mediaTypeName,
          parentId: model.parentId,
        });
      }

      try {
        const client = UmbracoManagementClient.getClient();
        const temporaryFileId = uuidv4();
        const { name: actualName, id } = await uploadMediaFile(client, {
          sourceType: effectiveSourceType,
          name: model.name,
          mediaTypeName: model.mediaTypeName,
          filePath: model.filePath,
          fileUrl: effectiveFileUrl,
          fileAsBase64: model.fileAsBase64,
          parentId: model.parentId,
          temporaryFileId,
        });
        return createToolResult({
          message: `Media "${actualName}" created successfully`,
          name: actualName,
          id,
        });
      } catch (error) {
        return createToolResultError({
          detail: `Error creating media: ${(error as Error).message}`,
        });
      }
    }),
  } satisfies ToolDefinition<typeof schema.shape, typeof createMediaOutputSchema.shape>;

  return withStandardDecorators(tool);
}

export default createCreateMediaTool({ allowFilePath: true });
