import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// Import the function
import { createFileStream } from "../../post/helpers/media-upload-helpers.js";

describe("media-upload-helpers", () => {
  describe("createFileStream - file path source", () => {
    it("should create stream from file path", async () => {
      // Create a temporary test file
      const testContent = "test content";
      const testFileName = `test-${Date.now()}-${Math.random()}.txt`;
      const testFilePath = path.join(os.tmpdir(), testFileName);

      fs.writeFileSync(testFilePath, testContent);

      // Verify file exists before proceeding
      expect(fs.existsSync(testFilePath)).toBe(true);

      try {
        const { readStream, tempFilePath } = await createFileStream(
          "filePath",
          testFilePath,
          undefined,
          undefined,
          testFileName,
          "test-id"
        );

        // Assert
        expect(readStream).toBeDefined();
        expect(tempFilePath).toBeNull(); // filePath source doesn't create temp files

        // Cleanup - properly close stream first
        await new Promise<void>((resolve) => {
          readStream.on('close', () => resolve());
          readStream.close();
        });
      } finally {
        // Cleanup test file
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      }
    });
  });

  describe("createFileStream - base64 source", () => {
    it("should create stream from base64 data", async () => {
      // Arrange
      const testBase64 = Buffer.from("test content").toString("base64");
      const fileName = "test-base64.txt";

      try {
        // Act
        const { readStream, tempFilePath } = await createFileStream(
          "base64",
          undefined,
          undefined,
          testBase64,
          fileName,
          "test-id"
        );

        // Assert
        expect(readStream).toBeDefined();
        expect(tempFilePath).toBeDefined();
        expect(tempFilePath).toContain("test-base64.txt");

        // Cleanup - properly close stream first
        await new Promise<void>((resolve) => {
          readStream.on('close', () => resolve());
          readStream.close();
        });

        if (tempFilePath && fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch (error) {
        // Ensure cleanup even on error
        throw error;
      }
    });
  });

});
