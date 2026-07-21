import GetElementFolderTool from "../folders/get/get-element-folder.js";
import { ElementFolderBuilder } from "./helpers/element-folder-builder.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_FOLDER_NAME = "_Test Get Element Folder";

describe("get-element-folder", () => {
  setupTestEnvironment();
  let folderBuilder: ElementFolderBuilder | null = null;

  afterEach(async () => {
    if (folderBuilder) {
      await folderBuilder.cleanup();
      folderBuilder = null;
    }
  });

  it("should get an element folder by id", async () => {
    // Arrange
    folderBuilder = new ElementFolderBuilder(TEST_FOLDER_NAME);
    await folderBuilder.create();
    const folderId = folderBuilder.getId();

    // Act
    const result = await GetElementFolderTool.handler(
      { id: folderId },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(createSnapshotResult(result, folderId)).toMatchSnapshot();
  });

  it("should return error for non-existent folder id", async () => {
    // Act
    const result = await GetElementFolderTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBe(true);
  });
});
