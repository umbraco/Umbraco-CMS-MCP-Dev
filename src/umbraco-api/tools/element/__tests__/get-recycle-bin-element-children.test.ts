import GetRecycleBinElementChildrenTool from "../items/get/get-recycle-bin-element-children.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementFolderBuilder } from "./helpers/element-folder-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_PARENT_FOLDER_NAME = "_Test RecycleBin Element Children Parent Folder";
const TEST_CHILD_ELEMENT_NAME = "_Test RecycleBin Element Children Child";

describe("get-recycle-bin-element-children", () => {
  setupTestEnvironment();

  beforeEach(async () => {
    await ElementTestHelper.emptyRecycleBin();
  });

  afterEach(async () => {
    await ElementTestHelper.emptyRecycleBin();
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should get children of a recycled folder", async () => {
    // Arrange - create a folder with an element inside, then move the folder to the recycle bin
    const parentFolderBuilder = new ElementFolderBuilder(TEST_PARENT_FOLDER_NAME);
    await parentFolderBuilder.create();
    const parentFolderId = parentFolderBuilder.getId();

    // Create an element inside the folder
    await new ElementBuilder()
      .withName(TEST_CHILD_ELEMENT_NAME)
      .withParent(parentFolderId)
      .create();

    // Move the folder to the recycle bin (child element moves with it)
    const client = UmbracoManagementClient.getClient();
    await client.putElementFolderByIdMoveToRecycleBin(parentFolderId);

    // Find the folder in the recycle bin root
    const recycleBinRoot = await client.getRecycleBinElementRoot({});
    const recycledFolder = recycleBinRoot.items.find(
      (item) => item.isFolder && item.name === TEST_PARENT_FOLDER_NAME
    );
    expect(recycledFolder).toBeDefined();

    // Act - get children of the recycled folder
    const result = await GetRecycleBinElementChildrenTool.handler(
      {
        parentId: recycledFolder!.id,
      },
      createMockRequestHandlerExtra()
    );

    // Assert - the folder's children should include the element
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();

    // Validate non-empty children
    const parsed = validateToolResponse(GetRecycleBinElementChildrenTool, result);
    expect(parsed.total).toBeGreaterThan(0);
    expect(parsed.items.length).toBeGreaterThan(0);
  });

  it("should handle non-existent parent in recycle bin", async () => {
    // Act
    const result = await GetRecycleBinElementChildrenTool.handler(
      {
        parentId: BLANK_UUID,
      },
      createMockRequestHandlerExtra()
    );

    // Assert - empty list is a valid response
    expect(result.isError).toBeFalsy();
    const parsed = validateToolResponse(GetRecycleBinElementChildrenTool, result);
    expect(parsed.total).toBe(0);
    expect(parsed.items).toHaveLength(0);
  });
});
