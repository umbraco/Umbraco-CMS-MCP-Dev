import { PartialViewHelper } from "./helpers/partial-view-helper.js";
import GetPartialViewSiblingsTool from "../items/get/get-siblings.js";
import { PartialViewFolderBuilder } from "./helpers/partial-view-folder-builder.js";
import { PartialViewBuilder } from "./helpers/partial-view-builder.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-partial-view-siblings", () => {
  setupTestEnvironment();

  const TEST_FOLDER_NAME = "_TestFolderForSiblings";
  const TEST_SIBLING_1_NAME = "_TestSibling1.cshtml";
  const TEST_SIBLING_2_NAME = "_TestSibling2.cshtml";
  const TEST_TARGET_NAME = "_TestTargetPartialView.cshtml";
  const TEST_CONTENT = "@* Test partial view content *@\n<p>Test content</p>";

  afterEach(async () => {
    await PartialViewHelper.cleanup(TEST_SIBLING_1_NAME);
    await PartialViewHelper.cleanup(TEST_SIBLING_2_NAME);
    await PartialViewHelper.cleanup(TEST_TARGET_NAME);
    await PartialViewHelper.cleanup(TEST_FOLDER_NAME);
  });

  it("should get sibling partial views", async () => {
    // Arrange: Create a parent folder with multiple children
    const folderBuilder = await new PartialViewFolderBuilder()
      .withName(TEST_FOLDER_NAME)
      .create();

    // Create first sibling
    await new PartialViewBuilder()
      .withName(TEST_SIBLING_1_NAME)
      .withContent(TEST_CONTENT)
      .withParent(folderBuilder.getPath())
      .create();

    // Create target partial view
    const targetBuilder = await new PartialViewBuilder()
      .withName(TEST_TARGET_NAME)
      .withContent(TEST_CONTENT)
      .withParent(folderBuilder.getPath())
      .create();

    // Create second sibling
    await new PartialViewBuilder()
      .withName(TEST_SIBLING_2_NAME)
      .withContent(TEST_CONTENT)
      .withParent(folderBuilder.getPath())
      .create();

    // Act: Get siblings for the target partial view
    const result = await GetPartialViewSiblingsTool.handler(
      {
        path: targetBuilder.getPath(),
      } as any,
      createMockRequestHandlerExtra()
    );

    // Assert: Validate response against tool's output schema
    const data = validateToolResponse(GetPartialViewSiblingsTool, result);
    expect(data).toHaveProperty('items');

    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent partial view", async () => {
    // Arrange: Use a non-existent path
    const nonExistentPath = "non-existent-path.cshtml";

    // Act: Try to get siblings for non-existent partial view
    const result = await GetPartialViewSiblingsTool.handler(
      {
        path: nonExistentPath,
      } as any,
      createMockRequestHandlerExtra()
    );

    // Assert: Verify error response
    expect(result).toMatchSnapshot();
  });
});
