import GetElementFolderReferencedDescendantsTool from "../get/get-element-folder-referenced-descendants.js";
import { ElementFolderBuilder } from "./helpers/element-folder-builder.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_FOLDER_NAME = "_Test Element Folder for Referenced Descendants";
const TEST_ELEMENT_NAME = "_Test Element Inside Folder for References";

describe("get-element-folder-referenced-descendants", () => {
  setupTestEnvironment();
  let folderBuilder: ElementFolderBuilder | null = null;

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
    if (folderBuilder) {
      await folderBuilder.cleanup();
      folderBuilder = null;
    }
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should get referenced descendants for an element folder", async () => {
    // Arrange - create a folder, then create an element inside it
    folderBuilder = new ElementFolderBuilder(TEST_FOLDER_NAME);
    await folderBuilder.create();
    const folderId = folderBuilder.getId();

    // Create an element inside the folder
    await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .withParent(folderId)
      .create();

    // Act
    const result = await GetElementFolderReferencedDescendantsTool.handler(
      { id: folderId },
      createMockRequestHandlerExtra()
    );

    // Assert - result may be empty list (no external references) or populated
    const normalizedResult = createSnapshotResult(result, folderId);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should return error for non-existent folder ID", async () => {
    // Act
    const result = await GetElementFolderReferencedDescendantsTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBe(true);
  });
});
