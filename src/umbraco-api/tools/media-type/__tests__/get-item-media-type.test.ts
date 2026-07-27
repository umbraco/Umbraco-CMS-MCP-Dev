import { MediaTypeTestHelper } from "./helpers/media-type-helper.js";
import GetItemMediaTypeTool from "../get/get-item-media-type.js";
import { MediaTypeBuilder } from "./helpers/media-type-builder.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-item-media-type", () => {
  setupTestEnvironment();

  const TEST_MEDIA_TYPE_NAME_1 = "_Test Media Type Item 1";
  const TEST_MEDIA_TYPE_NAME_2 = "_Test Media Type Item 2";

  afterEach(async () => {
    await MediaTypeTestHelper.cleanup(TEST_MEDIA_TYPE_NAME_1);
    await MediaTypeTestHelper.cleanup(TEST_MEDIA_TYPE_NAME_2);
  });

  it("should get media type items by ids", async () => {
    // Arrange: Create two media types
    const builder1 = await new MediaTypeBuilder()
      .withName(TEST_MEDIA_TYPE_NAME_1)
      .withDescription("Test media type 1 description")
      .withAllowedAsRoot(true)
      .create();

    const builder2 = await new MediaTypeBuilder()
      .withName(TEST_MEDIA_TYPE_NAME_2)
      .withDescription("Test media type 2 description")
      .withAllowedAsRoot(true)
      .create();

    // Act: Get items by their IDs
    const result = await GetItemMediaTypeTool.handler(
      {
        id: [builder1.getId(), builder2.getId()],
      },
      createMockRequestHandlerExtra()
    );

    // Assert: Verify response
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent media type", async () => {
    // Arrange: Use a non-existent ID
    const nonExistentId = BLANK_UUID;

    // Act: Try to get item for non-existent media type
    const result = await GetItemMediaTypeTool.handler(
      {
        id: [nonExistentId],
      },
      createMockRequestHandlerExtra()
    );

    // Assert: Verify error response
    expect(result).toMatchSnapshot();
  });
});
