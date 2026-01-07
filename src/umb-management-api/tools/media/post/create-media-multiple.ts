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

const createMediaMultipleSchema = z.object({
  sourceType: z.enum(["filePath", "url"]).describe("Media source type: 'filePath' for local files (most efficient), 'url' for web files. Base64 not supported for batch uploads due to token usage."),
  files: z.array(z.object({
    name: z.string().describe("The name of the media item"),
    filePath: z.string().optional().describe("Absolute path to the file (required if sourceType is 'filePath')"),
    fileUrl: z.string().url().optional().describe("URL to fetch the file from (required if sourceType is 'url')"),
    mediaTypeName: z.string().optional().describe(`Optional override: '${MEDIA_TYPE_IMAGE}', '${MEDIA_TYPE_ARTICLE}', '${MEDIA_TYPE_AUDIO}', '${MEDIA_TYPE_VIDEO}', '${MEDIA_TYPE_VECTOR_GRAPHICS}', '${MEDIA_TYPE_FILE}', or custom media type name. If not specified, defaults to '${MEDIA_TYPE_FILE}'`),
  })).describe("Array of files to upload (maximum 20 files per batch)"),
  parentId: z.string().uuid().optional().describe("Parent folder ID (defaults to root)"),
});

type CreateMediaMultipleParams = z.infer<typeof createMediaMultipleSchema>;

interface UploadResult {
  success: boolean;
  name: string;
  error?: string;
}

export const createMediaMultipleOutputSchema = z.object({
  summary: z.string(),
  results: z.array(z.object({
    success: z.boolean(),
    name: z.string(),
    error: z.string().optional()
  }))
});

const CreateMediaMultipleTool = {
  name: "create-media-multiple",
  description: `Batch upload multiple media files to Umbraco (maximum 20 files per batch).

  Supports any file type: images, documents, audio, video, SVG, or custom types.

  Source Types:
  1. filePath - Most efficient for local files, works with any size
     SECURITY: Requires UMBRACO_ALLOWED_MEDIA_PATHS environment variable
     to be configured with comma-separated allowed directories.
     Example: UMBRACO_ALLOWED_MEDIA_PATHS="/tmp/uploads,/var/media"
  2. url - Fetch from web URL

  Note: base64 is not supported for batch uploads due to token usage.

  The tool processes files sequentially and returns detailed results for each file.
  If some files fail, others will continue processing (continue-on-error strategy).`,
  inputSchema: createMediaMultipleSchema.shape,
  outputSchema: createMediaMultipleOutputSchema.shape,
  slices: ['create'],
  handler: (async (model: CreateMediaMultipleParams) => {
    // Validate batch size
    if (model.files.length > 20) {
      return createToolResultError({
        detail: `Batch upload limited to 20 files per call. You provided ${model.files.length} files. Please split into multiple batches.`
      });
    }

    const results: UploadResult[] = [];
    const client = UmbracoManagementClient.getClient();

    // Process files sequentially
    for (const file of model.files) {
      try {
        const temporaryFileId = uuidv4();
        const defaultMediaType = file.mediaTypeName || MEDIA_TYPE_FILE;

        const actualName = await uploadMediaFile(client, {
          sourceType: model.sourceType,
          name: file.name,
          mediaTypeName: defaultMediaType,
          filePath: file.filePath,
          fileUrl: file.fileUrl,
          fileAsBase64: undefined,
          parentId: model.parentId,
          temporaryFileId,
        });

        results.push({
          success: true,
          name: actualName,
        });

      } catch (error) {
        results.push({
          success: false,
          name: file.name,
          error: (error as Error).message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return createToolResult({
      summary: `Processed ${model.files.length} files: ${successCount} succeeded, ${failureCount} failed`,
      results
    });
  }),
} satisfies ToolDefinition<typeof createMediaMultipleSchema.shape, typeof createMediaMultipleOutputSchema.shape>;

export default withStandardDecorators(CreateMediaMultipleTool);
