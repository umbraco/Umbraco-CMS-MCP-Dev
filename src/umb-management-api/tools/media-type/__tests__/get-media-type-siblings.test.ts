import { MediaTypeTestHelper } from "./helpers/media-type-helper.js";
import GetMediaTypeSiblingsTool from "../items/get/get-siblings.js";
import { MediaTypeFolderBuilder } from "./helpers/media-type-folder-builder.js";
import { MediaTypeBuilder } from "./helpers/media-type-builder.js";
import { MediaTypeFolderTestHelper } from "./helpers/media-type-folder-helper.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-media-type-siblings", () => {
  setupTestEnvironment();

  const TEST_FOLDER_NAME = "_Test Folder for Siblings";
  const TEST_SIBLING_1_NAME = "_Test Sibling 1";
  const TEST_SIBLING_2_NAME = "_Test Sibling 2";
  const TEST_TARGET_NAME = "_Test Target MediaType";

  afterEach(async () => {
    await MediaTypeTestHelper.cleanup(TEST_SIBLING_1_NAME);
    await MediaTypeTestHelper.cleanup(TEST_SIBLING_2_NAME);
    await MediaTypeTestHelper.cleanup(TEST_TARGET_NAME);
    await MediaTypeFolderTestHelper.cleanup(TEST_FOLDER_NAME);
  });

  it("should get sibling media types", async () => {
    // Arrange: Create a parent folder with multiple children
    const folderBuilder = await new MediaTypeFolderBuilder()
      .withName(TEST_FOLDER_NAME)
      .create();

    // Create first sibling
    await new MediaTypeBuilder()
      .withName(TEST_SIBLING_1_NAME)
      .withParentId(folderBuilder.getId())
      .create();

    // Create target media type
    const targetBuilder = await new MediaTypeBuilder()
      .withName(TEST_TARGET_NAME)
      .withParentId(folderBuilder.getId())
      .create();

    // Create second sibling
    await new MediaTypeBuilder()
      .withName(TEST_SIBLING_2_NAME)
      .withParentId(folderBuilder.getId())
      .create();

    // Act: Get siblings for the target media type
    const result = await GetMediaTypeSiblingsTool.handler(
      {
        target: targetBuilder.getId(),
      } as any,
      createMockRequestHandlerExtra()
    );

    // Assert: Verify response
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent media type", async () => {
    // Arrange: Use a non-existent ID
    const nonExistentId = BLANK_UUID;

    // Act: Try to get siblings for non-existent media type
    const result = await GetMediaTypeSiblingsTool.handler(
      {
        target: nonExistentId,
      } as any,
      createMockRequestHandlerExtra()
    );

    // Assert: Verify error response
    expect(result).toMatchSnapshot();
  });
});
