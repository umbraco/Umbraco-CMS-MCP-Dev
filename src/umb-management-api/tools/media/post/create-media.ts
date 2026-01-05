import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { uploadMediaFile } from "./helpers/media-upload-helpers.js";
import {
  MEDIA_TYPE_IMAGE,
  MEDIA_TYPE_ARTICLE,
  MEDIA_TYPE_AUDIO,
  MEDIA_TYPE_VIDEO,
  MEDIA_TYPE_VECTOR_GRAPHICS,
  MEDIA_TYPE_FILE
} from "@/constants/constants.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, createToolResultError } from "@/helpers/mcp/tool-decorators.js";

const createMediaSchema = z.object({
  sourceType: z.enum(["filePath", "url", "base64"]).describe("Media source type: 'filePath' for local files (most efficient), 'url' for web files, 'base64' for embedded data (small files only)"),
  name: z.string().describe("The name of the media item"),
  mediaTypeName: z.string().describe(`Media type: '${MEDIA_TYPE_IMAGE}', '${MEDIA_TYPE_ARTICLE}', '${MEDIA_TYPE_AUDIO}', '${MEDIA_TYPE_VIDEO}', '${MEDIA_TYPE_VECTOR_GRAPHICS}', '${MEDIA_TYPE_FILE}', or custom media type name`),
  filePath: z.string().optional().describe("Absolute path to the file (required if sourceType is 'filePath')"),
  fileUrl: z.string().url().optional().describe("URL to fetch the file from (required if sourceType is 'url')"),
  fileAsBase64: z.string().optional().describe("Base64 encoded file data (required if sourceType is 'base64')"),
  parentId: z.string().uuid().optional().describe("Parent folder ID (defaults to root)"),
});

type CreateMediaParams = z.infer<typeof createMediaSchema>;

export const createMediaOutputSchema = z.object({
  message: z.string(),
  name: z.string()
});

const CreateMediaTool = {
  name: "create-media",
  description: `Upload any media file to Umbraco (images, documents, audio, video, SVG, or custom types).

  Media Types:
  - ${MEDIA_TYPE_IMAGE}: jpg, png, gif, webp, etc. (supports cropping)
  - ${MEDIA_TYPE_ARTICLE}: pdf, docx, doc (documents)
  - ${MEDIA_TYPE_AUDIO}: mp3, wav, etc.
  - ${MEDIA_TYPE_VIDEO}: mp4, webm, etc.
  - ${MEDIA_TYPE_VECTOR_GRAPHICS}: svg files only
  - ${MEDIA_TYPE_FILE}: any other file type
  - Custom: any custom media type created in Umbraco

  Source Types:
  1. filePath - Most efficient for local files, works with any size
     SECURITY: Requires UMBRACO_ALLOWED_MEDIA_PATHS environment variable
     to be configured with comma-separated allowed directories.
     Example: UMBRACO_ALLOWED_MEDIA_PATHS="/tmp/uploads,/var/media"
  2. url - Fetch from web URL
  3. base64 - Only for small files (<10KB) due to token usage

  The tool automatically:
  - Creates temporary files
  - Detects and validates media types (auto-corrects SVG vs Image)
  - Configures correct property editors (ImageCropper vs UploadField)
  - Cleans up temporary files`,
  inputSchema: createMediaSchema.shape,
  outputSchema: createMediaOutputSchema.shape,
  slices: ['create'],
  handler: (async (model: CreateMediaParams) => {
    try {
      const client = UmbracoManagementClient.getClient();
      const temporaryFileId = uuidv4();

      const actualName = await uploadMediaFile(client, {
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
        name: actualName
      });
    } catch (error) {
      return createToolResultError({
        detail: `Error creating media: ${(error as Error).message}`,
      });
    }
  }),
} satisfies ToolDefinition<typeof createMediaSchema.shape, typeof createMediaOutputSchema.shape>;

export default withStandardDecorators(CreateMediaTool);
