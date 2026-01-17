import CreateStylesheetFolderTool from "../post/create-stylesheet-folder.js";
import { StylesheetHelper } from "./helpers/stylesheet-helper.js";
import { StylesheetFolderBuilder } from "./helpers/stylesheet-folder-builder.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_FOLDER_NAME = "_TestCreateStylesheetFolder";
const EXISTING_FOLDER_NAME = "_ExistingStylesheetFolder";
const TEST_PARENT_FOLDER_NAME = "_TestParentFolder";

describe("create-stylesheet-folder", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await StylesheetHelper.cleanup(TEST_PARENT_FOLDER_NAME);
    await StylesheetHelper.cleanup(TEST_FOLDER_NAME);
    await StylesheetHelper.cleanup(EXISTING_FOLDER_NAME);
  });

  it("should create a stylesheet folder", async () => {
    // Arrange
    const params = {
      name: TEST_FOLDER_NAME,
      parent: undefined
    };

    // Act
    const result = await CreateStylesheetFolderTool.handler(params, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify the created folder exists by path
    const exists = await StylesheetHelper.verifyStylesheetFolder(`/${TEST_FOLDER_NAME}`);
    expect(exists).toBe(true);
  });

  it("should handle existing folder name", async () => {
    // Arrange - First create the folder
    await CreateStylesheetFolderTool.handler({
      name: EXISTING_FOLDER_NAME,
      parent: undefined
    }, createMockRequestHandlerExtra());

    // Act - Try to create it again with same name
    const result = await CreateStylesheetFolderTool.handler({
      name: EXISTING_FOLDER_NAME,
      parent: undefined
    }, createMockRequestHandlerExtra());

    // Assert
    expect(result).toMatchSnapshot();
  });

  it("should create folder with parent folder", async () => {
    // Arrange - Create parent folder first using builder
    const parentFolderBuilder = new StylesheetFolderBuilder()
      .withName(TEST_PARENT_FOLDER_NAME);
    
    await parentFolderBuilder.create();
    
    const params = {
      name: TEST_FOLDER_NAME,
      parent: {
        path: parentFolderBuilder.getPath()
      }
    };

    // Act
    const result = await CreateStylesheetFolderTool.handler(params, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
    
    // Verify the nested folder structure
    const exists = await StylesheetHelper.verifyStylesheetFolder(`${parentFolderBuilder.getPath()}/${TEST_FOLDER_NAME}`);
    expect(exists).toBe(true);
  });
});