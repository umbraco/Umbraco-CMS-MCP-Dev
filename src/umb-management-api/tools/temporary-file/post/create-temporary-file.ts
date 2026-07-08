import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import {
  type ToolDefinition,
  createToolResult,
  createToolResultError,
  withStandardDecorators,
  detectFileExtensionFromBuffer,
} from "@umbraco-cms/mcp-server-sdk";

// MCP-friendly schema that accepts base64 encoded file data
const createTemporaryFileSchema = z.object({
  id: z.string().uuid().describe("Unique identifier for the temporary file"),
  fileName: z.string().describe("Name of the file"),
  fileAsBase64: z.string().describe("File content encoded as base64 string"),
});

type CreateTemporaryFileParams = z.infer<typeof createTemporaryFileSchema>;

export const createTemporaryFileOutputSchema = z.object({
  message: z.string(),
  id: z.string().guid()
});

const CreateTemporaryFileTool = {
  name: "create-temporary-file",
  description: `Creates a new temporary file. The file will be deleted after 10 minutes.
  The temporary file id is used when uploading media files to Umbraco.
  The process is as follows:
  - Create a temporary file using this endpoint
  - Use the temporary file id when creating a media item using the media post endpoint

  Provide the file content as a base64 encoded string.`,
  inputSchema: createTemporaryFileSchema.shape,
  outputSchema: createTemporaryFileOutputSchema.shape,
  slices: ['create'],
  handler: (async (model: CreateTemporaryFileParams) => {
    try {
      // Decode base64 directly into a Buffer — no temp file, no fs.writeFileSync.
      // Cloudflare Workers' unenv polyfill doesn't implement fs.writeFileSync.
      const fileContent = Buffer.from(model.fileAsBase64, 'base64');

      // Ensure fileName has an extension - add one based on magic bytes if missing
      let fileName = model.fileName;
      if (!fileName.includes('.')) {
        const extension = detectFileExtensionFromBuffer(fileContent);
        fileName = `${fileName}${extension}`;
      }

      const client = UmbracoManagementClient.getClient();
      await client.postTemporaryFile({
        Id: model.id,
        File: fileContent,
        FileName: fileName,
      });

      return createToolResult({
        message: "Temporary file created successfully",
        id: model.id
      });
    } catch (error) {
      return createToolResultError({
        detail: `Error creating temporary file: ${(error as Error).message}`,
      });
    }
  }),
} satisfies ToolDefinition<typeof createTemporaryFileSchema.shape, typeof createTemporaryFileOutputSchema.shape>;

export default withStandardDecorators(CreateTemporaryFileTool);
