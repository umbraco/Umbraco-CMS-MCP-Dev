import GetMediaTypeAllowedAtRootTool from "../get/get-media-type-allowed-at-root.js";
import { MediaTypeBuilder } from "./helpers/media-type-builder.js";
import { MediaTypeTestHelper } from "./helpers/media-type-helper.js";
import { MediaTypeResponseModel } from "@/umb-management-api/schemas/index.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

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

    // Validate response against tool's output schema
    const parsed = validateToolResponse(GetMediaTypeAllowedAtRootTool, result);
    const testMediaType = (parsed.items as MediaTypeResponseModel[]).find(
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
