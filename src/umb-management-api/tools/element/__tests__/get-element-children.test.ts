import GetElementChildrenTool from "../items/get/get-element-children.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementFolderBuilder } from "./helpers/element-folder-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_PARENT_FOLDER_NAME = "_Test GetElementChildren Parent Folder";
const TEST_CHILD_ELEMENT_NAME = "_Test GetElementChildren Child Element";
const TEST_CHILD_FOLDER_NAME = "_Test GetElementChildren Child Folder";

describe("get-element-children", () => {
  setupTestEnvironment();

  let parentFolderBuilder: ElementFolderBuilder | null = null;
  let childFolderBuilder: ElementFolderBuilder | null = null;

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_CHILD_ELEMENT_NAME);
    if (childFolderBuilder) {
      await childFolderBuilder.cleanup();
      childFolderBuilder = null;
    }
    if (parentFolderBuilder) {
      await parentFolderBuilder.cleanup();
      parentFolderBuilder = null;
    }
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should get children of a folder containing an element and a nested folder", async () => {
    // Arrange - create a parent folder, then create an element and a child folder inside it
    parentFolderBuilder = new ElementFolderBuilder(TEST_PARENT_FOLDER_NAME);
    await parentFolderBuilder.create();
    const parentFolderId = parentFolderBuilder.getId();

    // Create an element inside the folder
    await new ElementBuilder()
      .withName(TEST_CHILD_ELEMENT_NAME)
      .withParent(parentFolderId)
      .create();

    // Create a child folder inside the parent folder
    childFolderBuilder = new ElementFolderBuilder(TEST_CHILD_FOLDER_NAME);
    childFolderBuilder.withParent(parentFolderId);
    await childFolderBuilder.create();

    // Act - get children of the parent folder
    const result = await GetElementChildrenTool.handler(
      {
        parentId: parentFolderId,
        foldersOnly: false,
        dataTypeId: undefined,
      },
      createMockRequestHandlerExtra()
    );

    // Assert - verify the response has non-empty items
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();

    // Validate the response has real children
    const parsed = validateToolResponse(GetElementChildrenTool, result);
    expect(parsed.total).toBeGreaterThan(0);
    expect(parsed.items.length).toBeGreaterThan(0);
  });

  it("should return empty items for non-existent parent", async () => {
    // Act
    const result = await GetElementChildrenTool.handler(
      {
        parentId: BLANK_UUID,
        foldersOnly: false,
        dataTypeId: undefined,
      },
      createMockRequestHandlerExtra()
    );

    // Assert - API returns an empty list, not an error
    expect(result.isError).toBeFalsy();
    const parsed = validateToolResponse(GetElementChildrenTool, result);
    expect(parsed.total).toBe(0);
    expect(parsed.items).toHaveLength(0);
  });
});
