import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

// Test schema to see what formats the LLM can provide
const testFileFormatSchema = z.object({
  // Try different input formats
  fileAsString: z.string().optional().describe("File content as a plain string"),
  fileAsBase64: z.string().optional().describe("File content as base64 encoded string"),
  fileAsDataUrl: z.string().optional().describe("File content as data URL (data:image/png;base64,...)"),
  fileAsBuffer: z.any().optional().describe("File content as buffer or binary data"),
  fileName: z.string().describe("Name for the file"),
  mimeType: z.string().optional().describe("MIME type of the file (e.g., image/png, text/plain)"),
});

type TestFileFormatParams = z.infer<typeof testFileFormatSchema>;

const TestFileFormatTool = CreateUmbracoTool(
  "test-file-format",
  `**EXPERIMENTAL TOOL** - Tests how the LLM passes file data and attempts to convert it to a ReadStream.

  This tool is for testing purposes to understand what format file data arrives in from the LLM,
  and to validate if we can convert it to the fs.ReadStream format required by the Umbraco API.

  Try providing file content in different formats:
  - fileAsString: Plain text content
  - fileAsBase64: Base64 encoded content
  - fileAsDataUrl: Data URL format (data:image/png;base64,...)
  - fileAsBuffer: Raw binary data

  The tool will report back what format was received and whether conversion to ReadStream succeeded.`,
  testFileFormatSchema.shape,
  async (model: TestFileFormatParams) => {
    const results: string[] = [];
    let tempFilePath: string | null = null;

    try {
      results.push("=== File Format Test Results ===\n");

      // Check what was provided
      results.push("Provided formats:");
      if (model.fileAsString) results.push("  ✓ fileAsString (length: " + model.fileAsString.length + ")");
      if (model.fileAsBase64) results.push("  ✓ fileAsBase64 (length: " + model.fileAsBase64.length + ")");
      if (model.fileAsDataUrl) results.push("  ✓ fileAsDataUrl (length: " + model.fileAsDataUrl.length + ")");
      if (model.fileAsBuffer) results.push("  ✓ fileAsBuffer (type: " + typeof model.fileAsBuffer + ")");
      results.push("");

      // Try to determine the actual data type received
      results.push("Type analysis:");
      if (model.fileAsString) {
        results.push("  fileAsString: " + typeof model.fileAsString);
      }
      if (model.fileAsBase64) {
        results.push("  fileAsBase64: " + typeof model.fileAsBase64);
        // Check if it's valid base64
        try {
          const decoded = Buffer.from(model.fileAsBase64, 'base64');
          results.push("    - Valid base64, decoded size: " + decoded.length + " bytes");
        } catch (e) {
          results.push("    - Invalid base64: " + (e as Error).message);
        }
      }
      if (model.fileAsDataUrl) {
        results.push("  fileAsDataUrl: " + typeof model.fileAsDataUrl);
        // Try to parse data URL
        const dataUrlMatch = model.fileAsDataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (dataUrlMatch) {
          results.push("    - Valid data URL");
          results.push("    - MIME type: " + dataUrlMatch[1]);
          results.push("    - Base64 data length: " + dataUrlMatch[2].length);
        } else {
          results.push("    - Invalid data URL format");
        }
      }
      if (model.fileAsBuffer) {
        results.push("  fileAsBuffer: " + typeof model.fileAsBuffer);
        results.push("    - Constructor: " + model.fileAsBuffer.constructor?.name);
        if (Buffer.isBuffer(model.fileAsBuffer)) {
          results.push("    - Is Buffer: yes, size: " + model.fileAsBuffer.length + " bytes");
        }
      }
      results.push("");

      // Try to convert to ReadStream
      results.push("Conversion attempts:");

      // Determine which format to use (priority: buffer > dataUrl > base64 > string)
      let fileContent: Buffer | null = null;

      if (model.fileAsBuffer && Buffer.isBuffer(model.fileAsBuffer)) {
        fileContent = model.fileAsBuffer;
        results.push("  Using fileAsBuffer (already a Buffer)");
      } else if (model.fileAsDataUrl) {
        const dataUrlMatch = model.fileAsDataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (dataUrlMatch) {
          fileContent = Buffer.from(dataUrlMatch[2], 'base64');
          results.push("  Converted fileAsDataUrl to Buffer (" + fileContent.length + " bytes)");
        }
      } else if (model.fileAsBase64) {
        try {
          fileContent = Buffer.from(model.fileAsBase64, 'base64');
          results.push("  Converted fileAsBase64 to Buffer (" + fileContent.length + " bytes)");
        } catch (e) {
          results.push("  Failed to convert fileAsBase64: " + (e as Error).message);
        }
      } else if (model.fileAsString) {
        fileContent = Buffer.from(model.fileAsString, 'utf-8');
        results.push("  Converted fileAsString to Buffer (" + fileContent.length + " bytes)");
      }

      if (fileContent) {
        // Write to temp file
        const tempDir = path.join(process.cwd(), 'temp-test-files');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        tempFilePath = path.join(tempDir, `${randomUUID()}-${model.fileName}`);
        fs.writeFileSync(tempFilePath, fileContent);
        results.push("  Wrote to temp file: " + tempFilePath);

        // Create ReadStream
        const readStream = fs.createReadStream(tempFilePath);
        results.push("  ✅ Successfully created ReadStream");
        results.push("  ReadStream path: " + readStream.path);

        // Verify we can read it
        const chunks: Buffer[] = [];
        for await (const chunk of readStream) {
          chunks.push(chunk);
        }
        const readBack = Buffer.concat(chunks);
        results.push("  ✅ Successfully read back " + readBack.length + " bytes from stream");

        // Compare
        if (readBack.equals(fileContent)) {
          results.push("  ✅ Content matches original!");
        } else {
          results.push("  ❌ Content mismatch!");
        }
      } else {
        results.push("  ❌ No valid file content provided");
      }

      results.push("");
      results.push("=== Summary ===");
      results.push("File name: " + model.fileName);
      results.push("MIME type: " + (model.mimeType || "not provided"));
      results.push("Temp file: " + (tempFilePath || "not created"));
      results.push("\nNote: Temp file will be cleaned up automatically.");

      return {
        content: [
          {
            type: "text" as const,
            text: results.join("\n"),
          },
        ],
      };
    } catch (error) {
      results.push("\n❌ Error: " + (error as Error).message);
      results.push("Stack: " + (error as Error).stack);

      return {
        content: [
          {
            type: "text" as const,
            text: results.join("\n"),
          },
        ],
        isError: true,
      };
    } finally {
      // Cleanup temp file
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
          results.push("\n✓ Cleaned up temp file");
        } catch (e) {
          results.push("\n⚠ Failed to cleanup temp file: " + (e as Error).message);
        }
      }
    }
  }
);

export default TestFileFormatTool;
