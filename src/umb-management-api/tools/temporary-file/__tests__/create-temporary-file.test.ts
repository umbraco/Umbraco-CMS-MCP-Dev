import CreateTemporaryFileTool from "../post/create-temporary-file.js";
import { TemporaryFileTestHelper } from "./helpers/temporary-file-helper.js";
import { readFileSync } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { EXAMPLE_IMAGE_PATH } from "@/constants/constants.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("create-temporary-file", () => {
  setupTestEnvironment();
  let testId = "";

  beforeEach(() => {
    testId = uuidv4();
  });

  afterEach(async () => {
    await TemporaryFileTestHelper.cleanup(testId);
  });

  it("should create a temporary file", async () => {
    const fileBuffer = readFileSync(
      join(process.cwd(), EXAMPLE_IMAGE_PATH)
    );
    const fileAsBase64 = fileBuffer.toString('base64');

    const result = await CreateTemporaryFileTool.handler(
      {
        id: testId,
        fileName: "example.jpg",
        fileAsBase64: fileAsBase64,
      },
      createMockRequestHandlerExtra()
    );

    expect(createSnapshotResult(result, testId)).toMatchSnapshot();

    const items = await TemporaryFileTestHelper.findTemporaryFiles(testId);
    // Normalize fileName which contains dynamic UUID (e.g., umbraco-upload-{uuid}-example.jpg)
    const normalizedItems = items.map((item: { fileName?: string }) => ({
      ...item,
      fileName: item.fileName?.replace(/umbraco-upload-[a-f0-9-]+-/, 'umbraco-upload-NORMALIZED-')
    }));
    expect(createSnapshotResult({ structuredContent: { items: normalizedItems } })).toMatchSnapshot();
  });

  it("should handle empty base64", async () => {
    const result = await CreateTemporaryFileTool.handler(
      {
        id: testId,
        fileName: "test.jpg",
        fileAsBase64: "",
      },
      createMockRequestHandlerExtra()
    );

    // Empty base64 creates an empty file, which should succeed
    // The API will accept it even though it's a 0-byte file
    expect(createSnapshotResult(result, testId)).toMatchSnapshot();
  });

  describe("filename extension detection", () => {
    it("should auto-detect PNG extension when filename has no extension", async () => {
      // 1x1 PNG image
      const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      const result = await CreateTemporaryFileTool.handler(
        {
          id: testId,
          fileName: "test-no-extension",
          fileAsBase64: pngBase64,
        },
        createMockRequestHandlerExtra()
      );

      expect(createSnapshotResult(result, testId)).toMatchSnapshot();

      // Verify the file was created with .png extension
      const items = await TemporaryFileTestHelper.findTemporaryFiles(testId);
      const normalizedItems = items.map((item: { fileName?: string }) => ({
        ...item,
        fileName: item.fileName?.replace(/umbraco-upload-[a-f0-9-]+-/, 'umbraco-upload-NORMALIZED-')
      }));
      expect(normalizedItems[0]?.fileName).toContain('.png');
      expect(createSnapshotResult({ structuredContent: { items: normalizedItems } })).toMatchSnapshot();
    });

    it("should auto-detect JPEG extension when filename has no extension", async () => {
      // Minimal JPEG (just headers, not a valid image but has correct magic bytes)
      const jpegBase64 = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]).toString('base64');

      const result = await CreateTemporaryFileTool.handler(
        {
          id: testId,
          fileName: "test-jpeg-no-ext",
          fileAsBase64: jpegBase64,
        },
        createMockRequestHandlerExtra()
      );

      expect(createSnapshotResult(result, testId)).toMatchSnapshot();

      const items = await TemporaryFileTestHelper.findTemporaryFiles(testId);
      const normalizedItems = items.map((item: { fileName?: string }) => ({
        ...item,
        fileName: item.fileName?.replace(/umbraco-upload-[a-f0-9-]+-/, 'umbraco-upload-NORMALIZED-')
      }));
      expect(normalizedItems[0]?.fileName).toContain('.jpg');
    });

    it("should preserve existing extension when provided", async () => {
      const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      const result = await CreateTemporaryFileTool.handler(
        {
          id: testId,
          fileName: "test-with-extension.png",
          fileAsBase64: pngBase64,
        },
        createMockRequestHandlerExtra()
      );

      expect(createSnapshotResult(result, testId)).toMatchSnapshot();

      const items = await TemporaryFileTestHelper.findTemporaryFiles(testId);
      const normalizedItems = items.map((item: { fileName?: string }) => ({
        ...item,
        fileName: item.fileName?.replace(/umbraco-upload-[a-f0-9-]+-/, 'umbraco-upload-NORMALIZED-')
      }));
      // Should keep original .png extension, not add another
      expect(normalizedItems[0]?.fileName).toBe('umbraco-upload-NORMALIZED-test-with-extension.png');
    });

    it("should auto-detect GIF extension when filename has no extension", async () => {
      // Minimal GIF header
      const gifBase64 = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]).toString('base64');

      const result = await CreateTemporaryFileTool.handler(
        {
          id: testId,
          fileName: "test-gif",
          fileAsBase64: gifBase64,
        },
        createMockRequestHandlerExtra()
      );

      expect(createSnapshotResult(result, testId)).toMatchSnapshot();

      const items = await TemporaryFileTestHelper.findTemporaryFiles(testId);
      const normalizedItems = items.map((item: { fileName?: string }) => ({
        ...item,
        fileName: item.fileName?.replace(/umbraco-upload-[a-f0-9-]+-/, 'umbraco-upload-NORMALIZED-')
      }));
      expect(normalizedItems[0]?.fileName).toContain('.gif');
    });
  });
});
