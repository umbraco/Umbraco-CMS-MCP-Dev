/**
 * `create-media` — upload a media asset to Umbraco from a URL, inline base64,
 * or (Node stdio only) a local filesystem path.
 *
 * For files attached to the chat by the host (ChatGPT-generated images,
 * user-uploaded files), use `create-media-from-file` instead — that tool
 * declares `_meta: { "openai/fileParams": ["file"] }` so the connector
 * injects a proper `{ download_url, file_id, ... }` object on the way through.
 *
 * URL uploads stream the source `response.body` straight into Umbraco's
 * TempFile endpoint via a custom multipart `ReadableStream` with
 * `duplex: "half"`, so multi-MB files no longer trip the MCP transport's
 * ~30 s wall-clock that bit the old buffered orval path.
 */
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { uploadMediaFile } from "./helpers/media-upload-helpers.js";
import { buildSourceTypeSection } from "./helpers/source-type-helpers.js";
import { streamingUploadFromUrl } from "./helpers/streaming-upload.js";
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
    ? "Media source type: 'filePath' for local files (Node stdio only), 'url' for public direct-download URLs (streamed; preferred for anything over ~100 KB), 'base64' for small inline data"
    : "Media source type: 'url' for public direct-download URLs (streamed; preferred for anything over ~100 KB), 'base64' for small inline data";

  const schema = z.object({
    sourceType: z.enum(sourceTypeValues).describe(sourceTypeDescription),
    name: z.string().describe("The name of the media item"),
    mediaTypeName: z.string().describe(`Media type: '${MEDIA_TYPE_IMAGE}', '${MEDIA_TYPE_ARTICLE}', '${MEDIA_TYPE_AUDIO}', '${MEDIA_TYPE_VIDEO}', '${MEDIA_TYPE_VECTOR_GRAPHICS}', '${MEDIA_TYPE_FILE}', or custom media type name`),
    filePath: z.string().optional().describe("Absolute path to the file (required if sourceType is 'filePath')"),
    fileUrl: z.string().url().optional().describe("[raw] Public, direct-download URL to fetch the file from (required if sourceType is 'url'). Must be reachable without authentication. Share/viewer links (e.g. drive.google.com/file/d/<id>/view, Dropbox ?dl=0, OneDrive view URLs) must be converted to their direct-download equivalent first — Google Drive: drive.google.com/uc?export=download&id=<id>. Uploads are streamed, so multi-MB files round-trip without timing out."),
    fileAsBase64: z.string().optional().describe("Base64 encoded file data (required if sourceType is 'base64')"),
    parentId: z.string().uuid().optional().describe("Parent folder ID (defaults to root)"),
  });

  type Params = z.infer<typeof schema>;

  const filePathSection = buildSourceTypeSection(options.allowFilePath, [
    'url - Stream from any public direct-download URL (Drive / Dropbox / etc.). Preferred for >100 KB.',
    'base64 - Only for small files (<10KB) due to token usage',
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
      try {
        // URL uploads use the streaming helper — pipes the source body
        // straight into Umbraco's TempFile endpoint without buffering, so
        // multi-MB files round-trip inside the MCP transport's wall-clock.
        if (model.sourceType === "url") {
          if (!model.fileUrl) {
            throw new Error("fileUrl is required when sourceType is 'url'");
          }
          const { name: actualName, id } = await streamingUploadFromUrl({
            sourceUrl: model.fileUrl,
            name: model.name,
            mediaTypeName: model.mediaTypeName,
            parentId: model.parentId,
          });
          return createToolResult({
            message: `Media "${actualName}" created successfully`,
            name: actualName,
            id,
          });
        }

        // filePath / base64 stay on the buffered helper — small payloads,
        // no streaming benefit.
        const client = UmbracoManagementClient.getClient();
        const temporaryFileId = uuidv4();
        const { name: actualName, id } = await uploadMediaFile(client, {
          sourceType: model.sourceType,
          name: model.name,
          mediaTypeName: model.mediaTypeName,
          filePath: model.filePath,
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
