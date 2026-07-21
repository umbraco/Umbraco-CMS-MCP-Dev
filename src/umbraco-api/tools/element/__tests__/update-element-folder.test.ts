import UpdateElementFolderTool from "../folders/put/update-element-folder.js";
import { ElementFolderBuilder } from "./helpers/element-folder-builder.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_FOLDER_NAME = "_Test Update Element Folder";
const UPDATED_FOLDER_NAME = "_Test Update Element Folder Updated";

describe("update-element-folder", () => {
  setupTestEnvironment();
  let folderBuilder: ElementFolderBuilder | null = null;

  afterEach(async () => {
    if (folderBuilder) {
      await folderBuilder.cleanup();
      folderBuilder = null;
    }
  });

  it("should update an element folder name", async () => {
    // Arrange
    folderBuilder = new ElementFolderBuilder(TEST_FOLDER_NAME);
    await folderBuilder.create();
    const folderId = folderBuilder.getId();

    // Act
    const result = await UpdateElementFolderTool.handler(
      {
        id: folderId,
        data: { name: UPDATED_FOLDER_NAME },
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });

  it("should return error for non-existent folder id", async () => {
    // Act
    const result = await UpdateElementFolderTool.handler(
      {
        id: BLANK_UUID,
        data: { name: UPDATED_FOLDER_NAME },
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBe(true);
  });
});
