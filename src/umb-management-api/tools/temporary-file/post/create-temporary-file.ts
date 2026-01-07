import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, createToolResultError } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

/**
 * Detects file extension from buffer magic bytes.
 * Common file types for media uploads.
 */
function detectFileExtensionFromBuffer(buffer: Buffer): string {
  if (buffer.length === 0) return '.bin';

  // Check magic bytes for common file types
  // PNG
  if (buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return '.png';
  }
  // JPEG
  if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xD8) {
    return '.jpg';
  }
  // GIF
  if (buffer.length >= 3 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return '.gif';
  }
  // WebP
  if (buffer.length >= 12 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return '.webp';
  }
  // SVG (XML-based, look for "<svg" or "<?xml")
  const start = buffer.toString('utf8', 0, Math.min(100, buffer.length)).toLowerCase();
  if (start.includes('<svg') || (start.includes('<?xml') && start.includes('svg'))) {
    return '.svg';
  }
  // PDF
  if (buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return '.pdf';
  }
  // MP4
  if (buffer.length >= 12 && buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
    return '.mp4';
  }

  // Default to .bin if unknown
  return '.bin';
}

// MCP-friendly schema that accepts base64 encoded file data
const createTemporaryFileSchema = z.object({
  id: z.string().uuid().describe("Unique identifier for the temporary file"),
  fileName: z.string().describe("Name of the file"),
  fileAsBase64: z.string().describe("File content encoded as base64 string"),
});

type CreateTemporaryFileParams = z.infer<typeof createTemporaryFileSchema>;

export const createTemporaryFileOutputSchema = z.object({
  message: z.string(),
  id: z.string().uuid()
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
    let tempFilePath: string | null = null;

    try {
      // Convert base64 to Buffer
      const fileContent = Buffer.from(model.fileAsBase64, 'base64');

      // Ensure fileName has an extension - add one based on magic bytes if missing
      let fileName = model.fileName;
      if (!fileName.includes('.')) {
        const extension = detectFileExtensionFromBuffer(fileContent);
        fileName = `${fileName}${extension}`;
      }

      // Write to temp file (required for fs.ReadStream which the API client needs)
      tempFilePath = path.join(os.tmpdir(), `umbraco-upload-${model.id}-${fileName}`);
      fs.writeFileSync(tempFilePath, fileContent);

      // Create ReadStream for Umbraco API
      const readStream = fs.createReadStream(tempFilePath);

      const client = UmbracoManagementClient.getClient();
      await client.postTemporaryFile({
        Id: model.id,
        File: readStream,
      });

      return createToolResult({
        message: "Temporary file created successfully",
        id: model.id
      });
    } catch (error) {
      return createToolResultError({
        detail: `Error creating temporary file: ${(error as Error).message}`,
      });
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
  }),
} satisfies ToolDefinition<typeof createTemporaryFileSchema.shape, typeof createTemporaryFileOutputSchema.shape>;

export default withStandardDecorators(CreateTemporaryFileTool);
