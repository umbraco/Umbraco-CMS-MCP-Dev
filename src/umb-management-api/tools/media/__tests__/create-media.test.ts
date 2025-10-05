import CreateMediaTool from "../post/create-media.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { jest } from "@jest/globals";
import { join } from "path";
import { EXAMPLE_IMAGE_PATH } from "@/constants/constants.js";

// Test constants
const TEST_IMAGE_NAME = "_Test Image Upload";
const TEST_FILE_NAME = "_Test File Upload";
const TEST_URL_IMAGE_NAME = "_Test URL Image Upload";
const TEST_BASE64_IMAGE_NAME = "_Test Base64 Image Upload";

const TEST_IMAGE_PATH = join(process.cwd(), EXAMPLE_IMAGE_PATH);
const TEST_PDF_PATH = join(process.cwd(), "/src/umb-management-api/tools/media/__tests__/test-files/example.pdf");
const TEST_IMAGE_URL = "http://localhost:56472/media/qbflidnm/phone-pen-binder.jpg";

// Small 1x1 red pixel PNG as base64 for testing
const TEST_BASE64_IMAGE = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";

describe("create-media", () => {
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
    await MediaTestHelper.cleanup(TEST_IMAGE_NAME);
    await MediaTestHelper.cleanup(TEST_FILE_NAME);
    await MediaTestHelper.cleanup(TEST_URL_IMAGE_NAME);
    await MediaTestHelper.cleanup(`${TEST_BASE64_IMAGE_NAME}.png`);

    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  it("should create image media", async () => {
    const result = await CreateMediaTool().handler(
      {
        sourceType: "filePath",
        name: TEST_IMAGE_NAME,
        mediaTypeName: "Image",
        filePath: TEST_IMAGE_PATH,
      },
      { signal: new AbortController().signal }
    );

    expect(result).toMatchSnapshot();

    const found = await MediaTestHelper.findMedia(TEST_IMAGE_NAME);
    expect(found).toBeDefined();
    expect(MediaTestHelper.getNameFromItem(found!)).toBe(TEST_IMAGE_NAME);
  });

  it("should create file media", async () => {
    const result = await CreateMediaTool().handler(
      {
        sourceType: "filePath",
        name: TEST_FILE_NAME,
        mediaTypeName: "File",
        filePath: TEST_PDF_PATH,
      },
      { signal: new AbortController().signal }
    );

    expect(result).toMatchSnapshot();

    const found = await MediaTestHelper.findMedia(TEST_FILE_NAME);
    expect(found).toBeDefined();
    expect(MediaTestHelper.getNameFromItem(found!)).toBe(TEST_FILE_NAME);
  });

  it("should handle non-existent file path", async () => {
    const result = await CreateMediaTool().handler(
      {
        sourceType: "filePath",
        name: TEST_IMAGE_NAME,
        mediaTypeName: "Image",
        filePath: "/non/existent/file.jpg",
      },
      { signal: new AbortController().signal }
    );

    expect(result).toMatchSnapshot();
    expect(result.isError).toBe(true);
  });

  it("should handle invalid media type", async () => {
    const result = await CreateMediaTool().handler(
      {
        sourceType: "filePath",
        name: TEST_IMAGE_NAME,
        mediaTypeName: "NonExistentMediaType",
        filePath: TEST_IMAGE_PATH,
      },
      { signal: new AbortController().signal }
    );

    expect(result).toMatchSnapshot();
    expect(result.isError).toBe(true);
  });

  it("should create media from URL", async () => {
    const result = await CreateMediaTool().handler(
      {
        sourceType: "url",
        name: `${TEST_URL_IMAGE_NAME}`,
        mediaTypeName: "Image",
        fileUrl: TEST_IMAGE_URL,
      },
      { signal: new AbortController().signal }
    );

    expect(result).toMatchSnapshot();

    // Media item name should be the original name, not with extension added
    const found = await MediaTestHelper.findMedia(TEST_URL_IMAGE_NAME);
    expect(found).toBeDefined();
    expect(MediaTestHelper.getNameFromItem(found!)).toBe(TEST_URL_IMAGE_NAME);
  });

  it("should create media from base64", async () => {
    const result = await CreateMediaTool().handler(
      {
        sourceType: "base64",
        name: `${TEST_BASE64_IMAGE_NAME}.png`,
        mediaTypeName: "Image",
        fileAsBase64: TEST_BASE64_IMAGE,
      },
      { signal: new AbortController().signal }
    );

    expect(result).toMatchSnapshot();

    const found = await MediaTestHelper.findMedia(`${TEST_BASE64_IMAGE_NAME}.png`);
    expect(found).toBeDefined();
    expect(MediaTestHelper.getNameFromItem(found!)).toBe(`${TEST_BASE64_IMAGE_NAME}.png`);
  });
});
