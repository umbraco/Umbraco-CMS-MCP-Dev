import CreateMediaTool from "../post/create-media.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { join } from "path";
import { EXAMPLE_IMAGE_PATH } from "@/constants/constants.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_IMAGE_NAME = "_Test Image Upload";
const TEST_FILE_NAME = "_Test File Upload";
const TEST_URL_IMAGE_NAME = "_Test URL Image Upload";
const TEST_BASE64_IMAGE_NAME = "_Test Base64 Image Upload";

const TEST_IMAGE_PATH = join(process.cwd(), EXAMPLE_IMAGE_PATH);
const TEST_PDF_PATH = join(process.cwd(), "/src/umb-management-api/tools/media/__tests__/test-files/example.pdf");
const TEST_IMAGE_URL = "http://localhost:56472/media/qbflidnm/phone-pen-binder.jpg";
const TEST_BASE64_IMAGE = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";

describe("create-media", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await MediaTestHelper.cleanup(TEST_IMAGE_NAME);
    await MediaTestHelper.cleanup(TEST_FILE_NAME);
    await MediaTestHelper.cleanup(TEST_URL_IMAGE_NAME);
    await MediaTestHelper.cleanup(`${TEST_BASE64_IMAGE_NAME}.png`);
  });

  it("should create image media", async () => {
    const result = await CreateMediaTool.handler(
      { sourceType: "filePath", name: TEST_IMAGE_NAME, mediaTypeName: "Image", filePath: TEST_IMAGE_PATH } as any,
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
    const found = await MediaTestHelper.findMedia(TEST_IMAGE_NAME);
    expect(found).toBeDefined();
    expect(MediaTestHelper.getNameFromItem(found!)).toBe(TEST_IMAGE_NAME);
  });

  it("should create file media", async () => {
    const result = await CreateMediaTool.handler(
      { sourceType: "filePath", name: TEST_FILE_NAME, mediaTypeName: "File", filePath: TEST_PDF_PATH } as any,
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
    const found = await MediaTestHelper.findMedia(TEST_FILE_NAME);
    expect(found).toBeDefined();
  });

  it("should handle non-existent file path", async () => {
    const result = await CreateMediaTool.handler(
      { sourceType: "filePath", name: TEST_IMAGE_NAME, mediaTypeName: "Image", filePath: "/non/existent/file.jpg" } as any,
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
    expect(result.isError).toBe(true);
  });

  it("should handle invalid media type", async () => {
    const result = await CreateMediaTool.handler(
      { sourceType: "filePath", name: TEST_IMAGE_NAME, mediaTypeName: "NonExistentMediaType", filePath: TEST_IMAGE_PATH } as any,
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
    expect(result.isError).toBe(true);
  });

  it("should create media from URL", async () => {
    const result = await CreateMediaTool.handler(
      { sourceType: "url", name: TEST_URL_IMAGE_NAME, mediaTypeName: "Image", fileUrl: TEST_IMAGE_URL } as any,
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
    const found = await MediaTestHelper.findMedia(TEST_URL_IMAGE_NAME);
    expect(found).toBeDefined();
  });

  it("should create media from base64", async () => {
    const result = await CreateMediaTool.handler(
      { sourceType: "base64", name: `${TEST_BASE64_IMAGE_NAME}.png`, mediaTypeName: "Image", fileAsBase64: TEST_BASE64_IMAGE } as any,
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
    const found = await MediaTestHelper.findMedia(`${TEST_BASE64_IMAGE_NAME}.png`);
    expect(found).toBeDefined();
  });
});
