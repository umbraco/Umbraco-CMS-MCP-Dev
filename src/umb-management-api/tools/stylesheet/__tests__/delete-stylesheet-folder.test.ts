import DeleteStylesheetFolderTool from "../delete/delete-stylesheet-folder.js";
import { StylesheetHelper } from "./helpers/stylesheet-helper.js";
import { StylesheetFolderBuilder } from "./helpers/stylesheet-folder-builder.js";
import { jest } from "@jest/globals";

const TEST_FOLDER_NAME = "_TestDeleteStylesheetFolder";
const NON_EXISTENT_FOLDER_PATH = "/_NonExistentFolder";

describe("delete-stylesheet-folder", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await StylesheetHelper.cleanup(TEST_FOLDER_NAME);
    console.error = originalConsoleError;
  });

  it("should delete a stylesheet folder", async () => {
    // Arrange - Create a folder first using builder
    const folderBuilder = new StylesheetFolderBuilder()
      .withName(TEST_FOLDER_NAME);
    
    await folderBuilder.create();
    const folderPath = folderBuilder.getPath();

    // Verify it exists before deletion
    const existsBefore = await StylesheetHelper.verifyStylesheetFolder(folderPath);
    expect(existsBefore).toBe(true);

    // Act
    const result = await DeleteStylesheetFolderTool.handler({ path: folderPath }, { signal: new AbortController().signal });

    // Assert
    expect(result).toMatchSnapshot();

    // Verify the folder no longer exists
    const existsAfter = await StylesheetHelper.verifyStylesheetFolder(folderPath);
    expect(existsAfter).toBe(false);
  });

  it("should handle non-existent folder", async () => {
    // Act
    const result = await DeleteStylesheetFolderTool.handler({ path: NON_EXISTENT_FOLDER_PATH }, { signal: new AbortController().signal });

    // Assert
    expect(result).toMatchSnapshot();
  });
});