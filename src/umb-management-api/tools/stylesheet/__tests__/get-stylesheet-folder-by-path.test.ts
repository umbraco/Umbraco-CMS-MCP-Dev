import GetStylesheetFolderByPathTool from "../get/get-stylesheet-folder-by-path.js";
import { StylesheetHelper } from "./helpers/stylesheet-helper.js";
import { StylesheetFolderBuilder } from "./helpers/stylesheet-folder-builder.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_FOLDER_NAME = "_TestGetStylesheetFolder";
const NON_EXISTENT_FOLDER_PATH = "/_NonExistentFolder";

describe("get-stylesheet-folder-by-path", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await StylesheetHelper.cleanup(TEST_FOLDER_NAME);
  });

  it("should get a stylesheet folder by path", async () => {
    // Arrange - Create a folder first using builder
    const folderBuilder = new StylesheetFolderBuilder()
      .withName(TEST_FOLDER_NAME);
    
    await folderBuilder.create();
    const folderPath = folderBuilder.getPath();

    // Act
    const result = await GetStylesheetFolderByPathTool.handler({ path: folderPath }, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify folder details
    const parsedResult = validateToolResponse(GetStylesheetFolderByPathTool, result);
    expect(parsedResult.name).toBe(TEST_FOLDER_NAME);
    expect(parsedResult.path).toBe(folderPath);
  });

  it("should handle non-existent folder", async () => {
    // Act
    const result = await GetStylesheetFolderByPathTool.handler({ path: NON_EXISTENT_FOLDER_PATH }, createMockRequestHandlerExtra());

    // Assert
    expect(result).toMatchSnapshot();
  });
});