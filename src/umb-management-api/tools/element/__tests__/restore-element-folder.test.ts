import RestoreElementFolderTool from "../folders/put/restore-element-folder.js";
import { ElementFolderBuilder } from "./helpers/element-folder-builder.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_FOLDER_NAME = "_Test Restore Element Folder";

describe("restore-element-folder", () => {
  setupTestEnvironment();
  let folderBuilder: ElementFolderBuilder | null = null;

  afterEach(async () => {
    if (folderBuilder) {
      await folderBuilder.cleanup();
      folderBuilder = null;
    }
  });

  it("should restore an element folder from the recycle bin", async () => {
    // Arrange - create folder and move it to the recycle bin
    folderBuilder = new ElementFolderBuilder(TEST_FOLDER_NAME);
    await folderBuilder.create();
    const folderId = folderBuilder.getId();

    const client = UmbracoManagementClient.getClient();
    await client.putElementFolderByIdMoveToRecycleBin(folderId);

    // Act
    const result = await RestoreElementFolderTool.handler(
      { id: folderId },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });

  it("should return error for non-existent folder id", async () => {
    // Act
    const result = await RestoreElementFolderTool.handler(
      { id: BLANK_UUID },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBe(true);
  });
});
