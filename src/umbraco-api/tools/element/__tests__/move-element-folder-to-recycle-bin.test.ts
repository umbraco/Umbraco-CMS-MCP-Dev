import MoveElementFolderToRecycleBinTool from "../folders/put/move-element-folder-to-recycle-bin.js";
import { ElementFolderBuilder } from "./helpers/element-folder-builder.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_FOLDER_NAME = "_Test Move Element Folder To Recycle Bin";

describe("move-element-folder-to-recycle-bin", () => {
  setupTestEnvironment();
  let folderBuilder: ElementFolderBuilder | null = null;

  afterEach(async () => {
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

  it("should move an element folder to the recycle bin", async () => {
    // Arrange
    folderBuilder = new ElementFolderBuilder(TEST_FOLDER_NAME);
    await folderBuilder.create();
    const folderId = folderBuilder.getId();

    // Act
    const result = await MoveElementFolderToRecycleBinTool.handler(
      { id: folderId },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });

  it("should return error for non-existent folder id", async () => {
    // Act
    const result = await MoveElementFolderToRecycleBinTool.handler(
      { id: BLANK_UUID },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBe(true);
  });
});
