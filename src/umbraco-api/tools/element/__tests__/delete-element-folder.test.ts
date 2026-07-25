import DeleteElementFolderTool from "../folders/delete/delete-element-folder.js";
import { ElementFolderBuilder } from "./helpers/element-folder-builder.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_FOLDER_NAME = "_Test Delete Element Folder";

describe("delete-element-folder", () => {
  setupTestEnvironment();

  it("should delete an element folder by id", async () => {
    // Arrange
    const folderBuilder = await new ElementFolderBuilder(TEST_FOLDER_NAME).create();
    const folderId = folderBuilder.getId();

    // Act
    const result = await DeleteElementFolderTool.handler(
      { id: folderId },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should return error for non-existent folder id", async () => {
    // Act
    const result = await DeleteElementFolderTool.handler(
      { id: BLANK_UUID },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBe(true);
  });
});
