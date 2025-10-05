import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { uploadMediaFile } from "./helpers/media-upload-helpers.js";

const createMediaMultipleSchema = z.object({
  sourceType: z.enum(["filePath", "url"]).describe("Media source type: 'filePath' for local files (most efficient), 'url' for web files. Base64 not supported for batch uploads due to token usage."),
  files: z.array(z.object({
    name: z.string().describe("The name of the media item"),
    filePath: z.string().optional().describe("Absolute path to the file (required if sourceType is 'filePath')"),
    fileUrl: z.string().url().optional().describe("URL to fetch the file from (required if sourceType is 'url')"),
    mediaTypeName: z.string().optional().describe("Optional override: 'Image', 'Article', 'Audio', 'Video', 'Vector Graphic (SVG)', 'File', or custom media type name. If not specified, defaults to 'File'"),
  })).describe("Array of files to upload (maximum 20 files per batch)"),
  parentId: z.string().uuid().optional().describe("Parent folder ID (defaults to root)"),
});

type CreateMediaMultipleParams = z.infer<typeof createMediaMultipleSchema>;

interface UploadResult {
  success: boolean;
  name: string;
  error?: string;
}

const CreateMediaMultipleTool = CreateUmbracoTool(
  "create-media-multiple",
  `Batch upload multiple media files to Umbraco (maximum 20 files per batch).

  Supports any file type: images, documents, audio, video, SVG, or custom types.

  Source Types:
  1. filePath - Most efficient for local files, works with any size
  2. url - Fetch from web URL

  Note: base64 is not supported for batch uploads due to token usage.

  The tool processes files sequentially and returns detailed results for each file.
  If some files fail, others will continue processing (continue-on-error strategy).`,
  createMediaMultipleSchema.shape,
  async (model: CreateMediaMultipleParams) => {
    // Validate batch size
    if (model.files.length > 20) {
      return {
        content: [{
          type: "text" as const,
          text: `Batch upload limited to 20 files per call. You provided ${model.files.length} files. Please split into multiple batches.`
        }],
        isError: true
      };
    }

    const results: UploadResult[] = [];
    const client = UmbracoManagementClient.getClient();

    // Process files sequentially
    for (const file of model.files) {
      try {
        const temporaryFileId = uuidv4();
        const defaultMediaType = file.mediaTypeName || 'File';

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

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            summary: `Processed ${model.files.length} files: ${successCount} succeeded, ${failureCount} failed`,
            results
          }, null, 2),
        },
      ],
    };
  }
);

export default CreateMediaMultipleTool;
