import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { jest } from "@jest/globals";

// Mock the validate-file-path module to allow testing without config
jest.unstable_mockModule("../../post/helpers/validate-file-path.js", () => ({
  validateFilePath: jest.fn((filePath: string) => path.resolve(filePath))
}));

// Import the functions (after mocking)
const { createFileStream, fetchMediaTypeId } = await import("../../post/helpers/media-upload-helpers.js");

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
          testFileName
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
          fileName
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

  describe("fetchMediaTypeId", () => {

    describe("custom media types", () => {
      it("should query API for custom media type", async () => {
        const customId = "custom-guid-12345";
        const mockFn: any = jest.fn();
        mockFn.mockResolvedValue({
          items: [
            { name: "Custom Type", id: customId }
          ]
        });
        const mockClient: any = {
          getItemMediaTypeSearch: mockFn
        };

        const id = await fetchMediaTypeId(mockClient, "Custom Type");

        expect(id).toBe(customId);
        expect(mockClient.getItemMediaTypeSearch).toHaveBeenCalledWith({ query: "Custom Type" });
      });

      it("should throw error for non-existent custom type", async () => {
        const mockFn: any = jest.fn();
        mockFn.mockResolvedValue({
          items: []
        });
        const mockClient: any = {
          getItemMediaTypeSearch: mockFn
        };

        await expect(
          fetchMediaTypeId(mockClient, "NonExistent")
        ).rejects.toThrow("Media type 'NonExistent' not found");

        expect(mockClient.getItemMediaTypeSearch).toHaveBeenCalledWith({ query: "NonExistent" });
      });

      it("should handle custom type with case-insensitive search", async () => {
        const customId = "custom-guid-67890";
        const mockFn: any = jest.fn();
        mockFn.mockResolvedValue({
          items: [
            { name: "My Custom Type", id: customId },
            { name: "Other Type", id: "other-id" }
          ]
        });
        const mockClient: any = {
          getItemMediaTypeSearch: mockFn
        };

        const id = await fetchMediaTypeId(mockClient, "my custom type");

        expect(id).toBe(customId);
        expect(mockClient.getItemMediaTypeSearch).toHaveBeenCalledWith({ query: "my custom type" });
      });
    });
  });

});
