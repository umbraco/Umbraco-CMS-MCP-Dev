import DeleteElementFolderFromRecycleBinTool from "../folders/delete/delete-element-folder-from-recycle-bin.js";
import { ElementFolderBuilder } from "./helpers/element-folder-builder.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_FOLDER_NAME = "_Test Delete Element Folder From Recycle Bin";

describe("delete-element-folder-from-recycle-bin", () => {
  setupTestEnvironment();

  it("should permanently delete an element folder from the recycle bin", async () => {
    // Arrange - create folder and move to recycle bin first
    const folderBuilder = await new ElementFolderBuilder(TEST_FOLDER_NAME).create();
    const folderId = folderBuilder.getId();

    const client = UmbracoManagementClient.getClient();
    await client.putElementFolderByIdMoveToRecycleBin(folderId);

    // Act
    const result = await DeleteElementFolderFromRecycleBinTool.handler(
      { id: folderId },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should return error for non-existent folder id", async () => {
    // Act
    const result = await DeleteElementFolderFromRecycleBinTool.handler(
      { id: BLANK_UUID },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBe(true);
  });
});
