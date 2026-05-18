// For host-attached files (ChatGPT-generated images, user uploads), use
// `create-media-from-file` instead — its `_meta: { "openai/fileParams": ... }`
// declaration is how ChatGPT's connector knows to inject a file object.

import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { uploadMediaFile } from "./helpers/media-upload-helpers.js";
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

export const createMediaOutputSchema = z.object({
  message: z.string(),
  name: z.string(),
  id: z.string().guid()
});

export function createCreateMediaTool(options: { allowFilePath: boolean }) {
  const sourceTypeValues = options.allowFilePath
    ? (["filePath", "url", "base64"] as const)
    : (["url", "base64"] as const);

  const sourceTypeDescription = options.allowFilePath
    ? "Media source type: 'filePath' for local files (Node stdio only), 'url' for public direct-download URLs (streamed; preferred for everything not already attached to the chat), 'base64' for TINY inline payloads only — the server rejects base64 above 10 KiB decoded to stop LLM-truncated or thumbnail-preview base64 from persisting as corrupt files"
    : "Media source type: 'url' for public direct-download URLs (streamed; preferred for everything not already attached to the chat), 'base64' for TINY inline payloads only — the server rejects base64 above 10 KiB decoded to stop LLM-truncated or thumbnail-preview base64 from persisting as corrupt files";

  const schema = z.object({
    sourceType: z.enum(sourceTypeValues).describe(sourceTypeDescription),
    name: z.string().describe("The name of the media item"),
    mediaTypeName: z.string().describe(`Media type: '${MEDIA_TYPE_IMAGE}', '${MEDIA_TYPE_ARTICLE}', '${MEDIA_TYPE_AUDIO}', '${MEDIA_TYPE_VIDEO}', '${MEDIA_TYPE_VECTOR_GRAPHICS}', '${MEDIA_TYPE_FILE}', or custom media type name`),
    filePath: z.string().optional().describe("Absolute path to the file (required if sourceType is 'filePath')"),
    fileUrl: z.string().url().optional().describe("[raw] Public, direct-download URL to fetch the file from (required if sourceType is 'url'). Must be reachable without authentication. Share/viewer links (e.g. drive.google.com/file/d/<id>/view, Dropbox ?dl=0, OneDrive view URLs) must be converted to their direct-download equivalent first — Google Drive: drive.google.com/uc?export=download&id=<id>. Uploads are streamed, so multi-MB files round-trip without timing out."),
    fileAsBase64: z.string().optional().describe("Base64-encoded file data (required if sourceType is 'base64'). HARD LIMIT: decoded payload must be ≤10 KiB; the server rejects anything larger because LLMs reliably truncate big base64 strings or substitute thumbnail previews, both producing corrupt files. Use sourceType='url' for everything bigger."),
    parentId: z.string().uuid().optional().describe("Parent folder ID (defaults to root)"),
  });

  type Params = z.infer<typeof schema>;

  const filePathSection = buildSourceTypeSection(options.allowFilePath, [
    'url - Stream from any public direct-download URL (Drive / Dropbox / etc.). Use this for anything above 10 KiB.',
    'base64 - ONLY for tiny inline payloads; server hard-rejects decoded base64 over 10 KiB to prevent LLM-truncated corrupt files.',
  ]);

  const tool = {
    name: "create-media",
    description: `Upload any media file to Umbraco (images, documents, audio, video, SVG, or custom types).

  For files attached to the chat by the host (ChatGPT-generated images,
  user-uploaded files), use the create-media-from-file tool instead — it
  handles the host's file-injection flow.

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
    handler: (async (model: Params) => {
      // url goes through the streaming helper in hosted (Worker) mode where the
      // auth context is wired up at init; Node stdio + Jest fall through to the
      // buffered orval path below, which handles url/filePath/base64 uniformly.
      if (model.sourceType === "url" && isStreamingAuthContextConfigured()) {
        if (!model.fileUrl) {
          return createToolResultError({
            detail: "Error creating media: fileUrl is required when sourceType is 'url'",
          });
        }
        return streamingUploadToToolResult({
          sourceUrl: model.fileUrl,
          name: model.name,
          mediaTypeName: model.mediaTypeName,
          parentId: model.parentId,
        });
      }

      try {
        const client = UmbracoManagementClient.getClient();
        const temporaryFileId = uuidv4();
        const { name: actualName, id } = await uploadMediaFile(client, {
          sourceType: model.sourceType,
          name: model.name,
          mediaTypeName: model.mediaTypeName,
          filePath: model.filePath,
          fileUrl: model.fileUrl,
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
