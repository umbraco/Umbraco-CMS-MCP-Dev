import GetMediaTypeAllowedAtRootTool from "../get/get-media-type-allowed-at-root.js";
import { MediaTypeBuilder } from "./helpers/media-type-builder.js";
import { MediaTypeTestHelper } from "./helpers/media-type-helper.js";
import { MediaTypeResponseModel } from "@/umb-management-api/schemas/index.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_MEDIATYPE_NAME = "_Test MediaType Root";

describe("get-media-type-allowed-at-root", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any test media types
    await MediaTypeTestHelper.cleanup(TEST_MEDIATYPE_NAME);
  });

  it("should get media types allowed at root", async () => {
    // Create test media type
    await new MediaTypeBuilder()
      .withName(TEST_MEDIATYPE_NAME)
      .withAllowedAsRoot(true)
      .create();

    // Get media types allowed at root
    const result = await GetMediaTypeAllowedAtRootTool.handler(
      {
        skip: 0,
        take: 10,
      } as any,
      createMockRequestHandlerExtra()
    );

    // Parse and find our test media type
    const parsed = result.structuredContent as {
      items: MediaTypeResponseModel[];
    };
    const testMediaType = parsed.items.find(
      (item) => item.name === TEST_MEDIATYPE_NAME
    );

    if (!testMediaType) {
      throw new Error("Test media type not found in results");
    }

    // Normalize the ID
    testMediaType.id = BLANK_UUID;

    // Verify just the test media type
    expect(testMediaType).toMatchSnapshot();
  });
});
