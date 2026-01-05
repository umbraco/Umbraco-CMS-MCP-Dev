import CreateMediaMultipleTool from "../post/create-media-multiple.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { join } from "path";
import { EXAMPLE_IMAGE_PATH } from "@/constants/constants.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

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
  setupTestEnvironment();

  afterEach(async () => {
    await MediaTestHelper.cleanup(TEST_BATCH_IMAGE_1);
    await MediaTestHelper.cleanup(TEST_BATCH_IMAGE_2);
    await MediaTestHelper.cleanup(TEST_BATCH_FILE_1);
    await MediaTestHelper.cleanup(TEST_MIXED_IMAGE);
    await MediaTestHelper.cleanup(TEST_MIXED_FILE);
    await MediaTestHelper.cleanup(TEST_URL_BATCH_IMAGE_1);
    await MediaTestHelper.cleanup(TEST_URL_BATCH_IMAGE_2);
  });

  it("should create multiple images in batch", async () => {
    const result = await CreateMediaMultipleTool.handler(
      { sourceType: "filePath", files: [
        { name: TEST_BATCH_IMAGE_1, filePath: TEST_IMAGE_PATH, mediaTypeName: "Image" },
        { name: TEST_BATCH_IMAGE_2, filePath: TEST_IMAGE_PATH, mediaTypeName: "Image" },
      ]} as any,
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
    expect(await MediaTestHelper.findMedia(TEST_BATCH_IMAGE_1)).toBeDefined();
    expect(await MediaTestHelper.findMedia(TEST_BATCH_IMAGE_2)).toBeDefined();
  });

  it("should create multiple files with mixed media types", async () => {
    const result = await CreateMediaMultipleTool.handler(
      { sourceType: "filePath", files: [
        { name: TEST_MIXED_IMAGE, filePath: TEST_IMAGE_PATH, mediaTypeName: "Image" },
        { name: TEST_MIXED_FILE, filePath: TEST_PDF_PATH, mediaTypeName: "File" },
      ]} as any,
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
    expect(await MediaTestHelper.findMedia(TEST_MIXED_IMAGE)).toBeDefined();
    expect(await MediaTestHelper.findMedia(TEST_MIXED_FILE)).toBeDefined();
  });

  it("should use default File media type when not specified", async () => {
    const result = await CreateMediaMultipleTool.handler(
      { sourceType: "filePath", files: [{ name: TEST_BATCH_FILE_1, filePath: TEST_PDF_PATH }]} as any,
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
    expect(await MediaTestHelper.findMedia(TEST_BATCH_FILE_1)).toBeDefined();
  });

  it("should handle batch size limit validation", async () => {
    const files = Array.from({ length: 21 }, (_, i) => ({
      name: `_Test Batch ${i}`, filePath: TEST_IMAGE_PATH, mediaTypeName: "Image",
    }));
    const result = await CreateMediaMultipleTool.handler(
      { sourceType: "filePath", files } as any,
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
    expect(result.isError).toBe(true);
  });

  it("should continue processing on individual file errors", async () => {
    const result = await CreateMediaMultipleTool.handler(
      { sourceType: "filePath", files: [
        { name: TEST_BATCH_IMAGE_1, filePath: TEST_IMAGE_PATH, mediaTypeName: "Image" },
        { name: TEST_BATCH_IMAGE_2, filePath: "/non/existent/file.jpg", mediaTypeName: "Image" },
      ]} as any,
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
    expect(await MediaTestHelper.findMedia(TEST_BATCH_IMAGE_1)).toBeDefined();
    expect(await MediaTestHelper.findMedia(TEST_BATCH_IMAGE_2)).toBeUndefined();
  });

  it("should create multiple media from URLs", async () => {
    const result = await CreateMediaMultipleTool.handler(
      { sourceType: "url", files: [
        { name: TEST_URL_BATCH_IMAGE_1, fileUrl: TEST_IMAGE_URL, mediaTypeName: "Image" },
        { name: TEST_URL_BATCH_IMAGE_2, fileUrl: TEST_IMAGE_URL, mediaTypeName: "Image" },
      ]} as any,
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
    expect(await MediaTestHelper.findMedia(TEST_URL_BATCH_IMAGE_1)).toBeDefined();
    expect(await MediaTestHelper.findMedia(TEST_URL_BATCH_IMAGE_2)).toBeDefined();
  });
});
