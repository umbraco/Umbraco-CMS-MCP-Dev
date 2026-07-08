import MoveElementFolderTool from "../folders/put/move-element-folder.js";
import { ElementFolderBuilder } from "./helpers/element-folder-builder.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_FOLDER_NAME = "_Test Move Element Folder";
const TEST_TARGET_FOLDER_NAME = "_Test Move Element Target Folder";

describe("move-element-folder", () => {
  setupTestEnvironment();
  let folderBuilder: ElementFolderBuilder | null = null;
  let targetFolderBuilder: ElementFolderBuilder | null = null;

  afterEach(async () => {
    if (folderBuilder) {
      await folderBuilder.cleanup();
      folderBuilder = null;
    }
    if (targetFolderBuilder) {
      await targetFolderBuilder.cleanup();
      targetFolderBuilder = null;
    }
  });

  it("should move an element folder to a new parent", async () => {
    // Arrange
    folderBuilder = new ElementFolderBuilder(TEST_FOLDER_NAME);
    await folderBuilder.create();

    targetFolderBuilder = new ElementFolderBuilder(TEST_TARGET_FOLDER_NAME);
    await targetFolderBuilder.create();

    const folderId = folderBuilder.getId();
    const targetId = targetFolderBuilder.getId();

    // Act
    const result = await MoveElementFolderTool.handler(
      {
        id: folderId,
        data: { target: { id: targetId } },
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });

  it("should return error for non-existent folder id", async () => {
    // Act
    const result = await MoveElementFolderTool.handler(
      {
        id: BLANK_UUID,
        data: { target: null },
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBe(true);
  });
});
