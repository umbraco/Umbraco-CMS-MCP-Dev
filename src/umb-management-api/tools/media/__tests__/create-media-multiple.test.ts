import CreateMediaMultipleTool from "../post/create-media-multiple.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { jest } from "@jest/globals";
import { join } from "path";
import { EXAMPLE_IMAGE_PATH } from "@/constants/constants.js";

// Test constants
const TEST_BATCH_IMAGE_1 = "_Test Batch Image 1";
const TEST_BATCH_IMAGE_2 = "_Test Batch Image 2";
const TEST_BATCH_FILE_1 = "_Test Batch File 1";
const TEST_MIXED_IMAGE = "_Test Mixed Image";
const TEST_MIXED_FILE = "_Test Mixed File";
const TEST_URL_BATCH_IMAGE_1 = "_Test URL Batch Image 1";
const TEST_URL_BATCH_IMAGE_2 = "_Test URL Batch Image 2";

const TEST_IMAGE_PATH = join(process.cwd(), EXAMPLE_IMAGE_PATH);
const TEST_PDF_PATH = join(process.cwd(), "/src/umb-management-api/tools/media/__tests__/test-files/example.pdf");
const TEST_IMAGE_URL = "http://localhost:56472/media/qbflidnm/phone-pen-binder.jpg";

describe("create-media-multiple", () => {
  let originalConsoleError: typeof console.error;
  let originalConsoleWarn: typeof console.warn;

  beforeEach(() => {
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(async () => {
    // Clean up all test media
    await MediaTestHelper.cleanup(TEST_BATCH_IMAGE_1);
    await MediaTestHelper.cleanup(TEST_BATCH_IMAGE_2);
    await MediaTestHelper.cleanup(TEST_BATCH_FILE_1);
    await MediaTestHelper.cleanup(TEST_MIXED_IMAGE);
    await MediaTestHelper.cleanup(TEST_MIXED_FILE);
    await MediaTestHelper.cleanup(TEST_URL_BATCH_IMAGE_1);
    await MediaTestHelper.cleanup(TEST_URL_BATCH_IMAGE_2);

    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  it("should create multiple images in batch", async () => {
    const result = await CreateMediaMultipleTool().handler(
      {
        sourceType: "filePath",
        files: [
          {
            name: TEST_BATCH_IMAGE_1,
            filePath: TEST_IMAGE_PATH,
            mediaTypeName: "Image",
          },
          {
            name: TEST_BATCH_IMAGE_2,
            filePath: TEST_IMAGE_PATH,
            mediaTypeName: "Image",
          },
        ],
      },
      { signal: new AbortController().signal }
    );

    expect(result).toMatchSnapshot();

    const found1 = await MediaTestHelper.findMedia(TEST_BATCH_IMAGE_1);
    expect(found1).toBeDefined();
    expect(MediaTestHelper.getNameFromItem(found1!)).toBe(TEST_BATCH_IMAGE_1);

    const found2 = await MediaTestHelper.findMedia(TEST_BATCH_IMAGE_2);
    expect(found2).toBeDefined();
    expect(MediaTestHelper.getNameFromItem(found2!)).toBe(TEST_BATCH_IMAGE_2);
  });

  it("should create multiple files with mixed media types", async () => {
    const result = await CreateMediaMultipleTool().handler(
      {
        sourceType: "filePath",
        files: [
          {
            name: TEST_MIXED_IMAGE,
            filePath: TEST_IMAGE_PATH,
            mediaTypeName: "Image",
          },
          {
            name: TEST_MIXED_FILE,
            filePath: TEST_PDF_PATH,
            mediaTypeName: "File",
          },
        ],
      },
      { signal: new AbortController().signal }
    );

    expect(result).toMatchSnapshot();

    const foundImage = await MediaTestHelper.findMedia(TEST_MIXED_IMAGE);
    expect(foundImage).toBeDefined();
    expect(MediaTestHelper.getNameFromItem(foundImage!)).toBe(TEST_MIXED_IMAGE);

    const foundFile = await MediaTestHelper.findMedia(TEST_MIXED_FILE);
    expect(foundFile).toBeDefined();
    expect(MediaTestHelper.getNameFromItem(foundFile!)).toBe(TEST_MIXED_FILE);
  });

  it("should use default File media type when not specified", async () => {
    const result = await CreateMediaMultipleTool().handler(
      {
        sourceType: "filePath",
        files: [
          {
            name: TEST_BATCH_FILE_1,
            filePath: TEST_PDF_PATH,
            // mediaTypeName not specified - should default to "File"
          },
        ],
      },
      { signal: new AbortController().signal }
    );

    expect(result).toMatchSnapshot();

    const found = await MediaTestHelper.findMedia(TEST_BATCH_FILE_1);
    expect(found).toBeDefined();
    expect(MediaTestHelper.getNameFromItem(found!)).toBe(TEST_BATCH_FILE_1);
  });

  it("should handle batch size limit validation", async () => {
    // Create an array of 21 files to exceed the limit
    const files = Array.from({ length: 21 }, (_, i) => ({
      name: `_Test Batch ${i}`,
      filePath: TEST_IMAGE_PATH,
      mediaTypeName: "Image",
    }));

    const result = await CreateMediaMultipleTool().handler(
      {
        sourceType: "filePath",
        files,
      },
      { signal: new AbortController().signal }
    );

    expect(result).toMatchSnapshot();
    expect(result.isError).toBe(true);
  });

  it("should continue processing on individual file errors", async () => {
    const result = await CreateMediaMultipleTool().handler(
      {
        sourceType: "filePath",
        files: [
          {
            name: TEST_BATCH_IMAGE_1,
            filePath: TEST_IMAGE_PATH,
            mediaTypeName: "Image",
          },
          {
            name: TEST_BATCH_IMAGE_2,
            filePath: "/non/existent/file.jpg", // This will fail
            mediaTypeName: "Image",
          },
        ],
      },
      { signal: new AbortController().signal }
    );

    expect(result).toMatchSnapshot();

    // First file should be created
    const found1 = await MediaTestHelper.findMedia(TEST_BATCH_IMAGE_1);
    expect(found1).toBeDefined();
    expect(MediaTestHelper.getNameFromItem(found1!)).toBe(TEST_BATCH_IMAGE_1);

    // Second file should not be created
    const found2 = await MediaTestHelper.findMedia(TEST_BATCH_IMAGE_2);
    expect(found2).toBeUndefined();
  });

  it("should create multiple media from URLs", async () => {
    const result = await CreateMediaMultipleTool().handler(
      {
        sourceType: "url",
        files: [
          {
            name: TEST_URL_BATCH_IMAGE_1, // Extension only added to temp file, not media name
            fileUrl: TEST_IMAGE_URL,
            mediaTypeName: "Image",
          },
          {
            name: TEST_URL_BATCH_IMAGE_2, // Extension only added to temp file, not media name
            fileUrl: TEST_IMAGE_URL,
            mediaTypeName: "Image",
          },
        ],
      },
      { signal: new AbortController().signal }
    );

    expect(result).toMatchSnapshot();

    // Media items should have original names (no extension added)
    const found1 = await MediaTestHelper.findMedia(TEST_URL_BATCH_IMAGE_1);
    expect(found1).toBeDefined();
    expect(MediaTestHelper.getNameFromItem(found1!)).toBe(TEST_URL_BATCH_IMAGE_1);

    const found2 = await MediaTestHelper.findMedia(TEST_URL_BATCH_IMAGE_2);
    expect(found2).toBeDefined();
    expect(MediaTestHelper.getNameFromItem(found2!)).toBe(TEST_URL_BATCH_IMAGE_2);
  });
});
