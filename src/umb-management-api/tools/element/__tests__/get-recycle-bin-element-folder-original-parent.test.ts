import GetRecycleBinElementFolderOriginalParentTool from "../get/get-recycle-bin-element-folder-original-parent.js";
import { ElementFolderBuilder } from "./helpers/element-folder-builder.js";
import { UmbracoManagementClient } from "@umb-management-client";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_PARENT_FOLDER_NAME = "_Test Element FolderOriginalParent Parent";
const TEST_CHILD_FOLDER_NAME = "_Test Element FolderOriginalParent Child";

describe("get-recycle-bin-element-folder-original-parent", () => {
  setupTestEnvironment();
  let parentFolderBuilder: ElementFolderBuilder | null = null;
  let childFolderBuilder: ElementFolderBuilder | null = null;

  afterEach(async () => {
    // Clean up items in the recycle bin first
    try {
      const client = UmbracoManagementClient.getClient();
      // Empty the recycle bin to clean recycled items
      await client.deleteRecycleBinElement();
    } catch {
      // Ignore cleanup errors
    }

    // Then clean up the parent folder (if not moved to recycle bin)
    if (parentFolderBuilder) {
      await parentFolderBuilder.cleanup();
      parentFolderBuilder = null;
    }
    childFolderBuilder = null;
  });

  it("should return the original parent folder of a recycled child folder", async () => {
    // Arrange - create parent folder, then create child folder under it
    parentFolderBuilder = new ElementFolderBuilder(TEST_PARENT_FOLDER_NAME);
    await parentFolderBuilder.create();
    const parentFolderId = parentFolderBuilder.getId();

    childFolderBuilder = new ElementFolderBuilder(TEST_CHILD_FOLDER_NAME);
    childFolderBuilder.withParent(parentFolderId);
    await childFolderBuilder.create();
    const childFolderId = childFolderBuilder.getId();

    // Move child folder to recycle bin
    const client = UmbracoManagementClient.getClient();
    await client.putElementFolderByIdMoveToRecycleBin(childFolderId);

    // Act - get original parent of the recycled child folder
    const result = await GetRecycleBinElementFolderOriginalParentTool.handler(
      { id: childFolderId },
      createMockRequestHandlerExtra()
    );

    // Assert - original parent should be the parent folder (not null)
    const normalizedResult = createSnapshotResult(result, parentFolderId);
    expect(normalizedResult).toMatchSnapshot();

    // Validate that the result has the parent folder id
    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).not.toBeNull();
    const structured = result.structuredContent as { id: string };
    expect(structured.id).toBe(parentFolderId);
  });

  it("should handle non-existent recycled folder ID", async () => {
    // Act
    const result = await GetRecycleBinElementFolderOriginalParentTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBe(true);
  });
});
