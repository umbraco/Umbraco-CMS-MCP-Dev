import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { uploadMediaFile } from "./helpers/media-upload-helpers.js";

const createMediaSchema = z.object({
  sourceType: z.enum(["filePath", "url", "base64"]).describe("Media source type: 'filePath' for local files (most efficient), 'url' for web files, 'base64' for embedded data (small files only)"),
  name: z.string().describe("The name of the media item"),
  mediaTypeName: z.string().describe("Media type: 'Image', 'Article', 'Audio', 'Video', 'Vector Graphic (SVG)', 'File', or custom media type name"),
  filePath: z.string().optional().describe("Absolute path to the file (required if sourceType is 'filePath')"),
  fileUrl: z.string().url().optional().describe("URL to fetch the file from (required if sourceType is 'url')"),
  fileAsBase64: z.string().optional().describe("Base64 encoded file data (required if sourceType is 'base64')"),
  parentId: z.string().uuid().optional().describe("Parent folder ID (defaults to root)"),
});

type CreateMediaParams = z.infer<typeof createMediaSchema>;

const CreateMediaTool = CreateUmbracoTool(
  "create-media",
  `Upload any media file to Umbraco (images, documents, audio, video, SVG, or custom types).

  Media Types:
  - Image: jpg, png, gif, webp, etc. (supports cropping)
  - Article: pdf, docx, doc (documents)
  - Audio: mp3, wav, etc.
  - Video: mp4, webm, etc.
  - Vector Graphic (SVG): svg files only
  - File: any other file type
  - Custom: any custom media type created in Umbraco

  Source Types:
  1. filePath - Most efficient for local files, works with any size
  2. url - Fetch from web URL
  3. base64 - Only for small files (<10KB) due to token usage

  The tool automatically:
  - Creates temporary files
  - Detects and validates media types (auto-corrects SVG vs Image)
  - Configures correct property editors (ImageCropper vs UploadField)
  - Cleans up temporary files`,
  createMediaSchema.shape,
  async (model: CreateMediaParams) => {
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

      return {
        content: [
          {
            type: "text" as const,
            text: `Media "${actualName}" created successfully`,
          },
        ],
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

export default CreateMediaTool;
