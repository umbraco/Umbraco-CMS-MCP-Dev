import GetRecycleBinElementFolderOriginalParentTool from "../get/get-recycle-bin-element-folder-original-parent.js";
import { ElementFolderBuilder } from "./helpers/element-folder-builder.js";
import { UmbracoManagementClient } from "@umb-management-client";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_FOLDER_NAME = "_Test Element Folder for Recycle Bin Original Parent";

describe("get-recycle-bin-element-folder-original-parent", () => {
  setupTestEnvironment();
  let folderBuilder: ElementFolderBuilder | null = null;

  afterEach(async () => {
    // Clean up the folder from the recycle bin if it was moved there
    if (folderBuilder) {
      try {
        const client = UmbracoManagementClient.getClient();
        await client.deleteRecycleBinElementFolderById(folderBuilder.getId());
      } catch {
        // Already cleaned up or not in recycle bin
      }
      folderBuilder = null;
    }
  });

  it("should get the original parent of a recycled element folder", async () => {
    // Arrange - create folder and move it to recycle bin
    folderBuilder = new ElementFolderBuilder(TEST_FOLDER_NAME);
    await folderBuilder.create();
    const folderId = folderBuilder.getId();

    const client = UmbracoManagementClient.getClient();
    await client.putElementFolderByIdMoveToRecycleBin(folderId);

    // Act
    const result = await GetRecycleBinElementFolderOriginalParentTool.handler(
      { id: folderId },
      createMockRequestHandlerExtra()
    );

    // Assert - might be null if no original parent (root-level folder)
    const data = result.structuredContent;
    if (data === null || data === undefined) {
      expect(result).toMatchSnapshot();
    } else {
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();
    }
  });

  it("should handle non-existent recycled folder ID", async () => {
    // Act
    const result = await GetRecycleBinElementFolderOriginalParentTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
