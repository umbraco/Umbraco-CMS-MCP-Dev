import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { z } from "zod";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

// MCP-friendly schema that accepts base64 encoded file data
const createTemporaryFileSchema = z.object({
  id: z.string().uuid().describe("Unique identifier for the temporary file"),
  fileName: z.string().describe("Name of the file"),
  fileAsBase64: z.string().describe("File content encoded as base64 string"),
});

type CreateTemporaryFileParams = z.infer<typeof createTemporaryFileSchema>;

const CreateTemporaryFileTool = CreateUmbracoTool(
  "create-temporary-file",
  `Creates a new temporary file. The file will be deleted after 10 minutes.
  The temporary file id is used when uploading media files to Umbraco.
  The process is as follows:
  - Create a temporary file using this endpoint
  - Use the temporary file id when creating a media item using the media post endpoint

  Provide the file content as a base64 encoded string.`,
  createTemporaryFileSchema.shape,
  async (model: CreateTemporaryFileParams) => {
    let tempFilePath: string | null = null;

    try {
      // Convert base64 to Buffer
      const fileContent = Buffer.from(model.fileAsBase64, 'base64');

      // Write to temp file (required for fs.ReadStream which the API client needs)
      tempFilePath = path.join(os.tmpdir(), `umbraco-upload-${model.id}-${model.fileName}`);
      fs.writeFileSync(tempFilePath, fileContent);

      // Create ReadStream for Umbraco API
      const readStream = fs.createReadStream(tempFilePath);

      const client = UmbracoManagementClient.getClient();
      await client.postTemporaryFile({
        Id: model.id,
        File: readStream,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ id: model.id }),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error creating temporary file: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    } finally {
      // Cleanup temp file
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (e) {
          console.error('Failed to cleanup temp file:', e);
        }
      }
    }
  }
);

export default CreateTemporaryFileTool;
