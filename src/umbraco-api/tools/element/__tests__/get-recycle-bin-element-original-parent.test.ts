import GetRecycleBinElementOriginalParentTool from "../get/get-recycle-bin-element-original-parent.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementFolderBuilder } from "./helpers/element-folder-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_PARENT_FOLDER_NAME = "_Test Element Original Parent Folder";
const TEST_ELEMENT_NAME = "_Test Element Original Parent";

describe("get-recycle-bin-element-original-parent", () => {
  setupTestEnvironment();

  let parentFolderBuilder: ElementFolderBuilder | null = null;

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
    await ElementTestHelper.emptyRecycleBin();
    if (parentFolderBuilder) {
      await parentFolderBuilder.cleanup();
      parentFolderBuilder = null;
    }
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should return the original parent folder of a recycled element", async () => {
    // Arrange - create a folder, create element inside it, then recycle the element
    parentFolderBuilder = new ElementFolderBuilder(TEST_PARENT_FOLDER_NAME);
    await parentFolderBuilder.create();
    const parentFolderId = parentFolderBuilder.getId();

    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .withParent(parentFolderId)
      .create();

    await builder.moveToRecycleBin();

    const recycleBinElement = await ElementTestHelper.findElementInRecycleBin(TEST_ELEMENT_NAME);
    expect(recycleBinElement).toBeDefined();

    // Act
    const result = await GetRecycleBinElementOriginalParentTool.handler(
      { id: recycleBinElement!.id },
      createMockRequestHandlerExtra()
    );

    // Assert - original parent should be the folder, not null
    const normalizedResult = createSnapshotResult(result, parentFolderId);
    expect(normalizedResult).toMatchSnapshot();

    // Validate that the result has the parent folder id
    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).not.toBeNull();
    const structured = result.structuredContent as { id: string };
    expect(structured.id).toBe(parentFolderId);
  });

  it("should handle non-existent recycled element", async () => {
    // Act
    const result = await GetRecycleBinElementOriginalParentTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBe(true);
  });
});
