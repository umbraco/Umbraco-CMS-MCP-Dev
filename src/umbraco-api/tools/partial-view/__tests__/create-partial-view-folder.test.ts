import CreatePartialViewFolderTool from "../post/create-partial-view-folder.js";
import { PartialViewHelper } from "./helpers/partial-view-helper.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_FOLDER_NAME = "_TestCreateFolder";
const EXISTING_FOLDER_NAME = "_ExistingFolder";

describe("create-partial-view-folder", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await PartialViewHelper.cleanup(TEST_FOLDER_NAME);
    await PartialViewHelper.cleanup(EXISTING_FOLDER_NAME);
  });

  it("should create a partial view folder", async () => {
    // Arrange
    const params = {
      name: TEST_FOLDER_NAME
    };

    // Act
    const result = await CreatePartialViewFolderTool.handler(params as any, createMockRequestHandlerExtra());

    // Assert
    const data = validateToolResponse(CreatePartialViewFolderTool, result);
    expect(data).toHaveProperty("message");
    expect(data).toHaveProperty("path");

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify the created folder exists
    const searchResult = await PartialViewHelper.findPartialViews(TEST_FOLDER_NAME);
    const normalizedSearchResult = searchResult.map(item => ({
      ...item,
      id: item.id ? BLANK_UUID : item.id,
      parent: item.parent?.id ? { ...item.parent, id: BLANK_UUID } : item.parent
    }));
    expect(normalizedSearchResult).toMatchSnapshot();
  });

  it("should handle existing folder name", async () => {
    // Arrange - First create the folder
    await CreatePartialViewFolderTool.handler({
      name: EXISTING_FOLDER_NAME
    } as any, createMockRequestHandlerExtra());

    // Act - Try to create it again
    const result = await CreatePartialViewFolderTool.handler({
      name: EXISTING_FOLDER_NAME
    } as any, createMockRequestHandlerExtra());

    // Assert
    expect(result).toMatchSnapshot();
  });

});