import DeletePartialViewFolderTool from "../delete/delete-partial-view-folder.js";
import { PartialViewFolderBuilder } from "./helpers/partial-view-folder-builder.js";
import { PartialViewBuilder } from "./helpers/partial-view-builder.js";
import { PartialViewHelper } from "./helpers/partial-view-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const TEST_FOLDER_NAME = "_TestDeletePartialViewFolder";
const TEST_PARTIAL_VIEW_NAME = "_TestPartialViewInFolder.cshtml";
const TEST_CONTENT = "@* Test content in folder *@\n<div><p>Test Content</p></div>";
const NON_EXISTENT_PATH = "/_NonExistentFolder";

describe("delete-partial-view-folder", () => {
  let originalConsoleError: typeof console.error;
  let folderBuilder: PartialViewFolderBuilder;
  let partialViewBuilder: PartialViewBuilder;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    folderBuilder = new PartialViewFolderBuilder();
    partialViewBuilder = new PartialViewBuilder();
  });

  afterEach(async () => {
    await PartialViewHelper.cleanup(TEST_FOLDER_NAME);
    await PartialViewHelper.cleanup(TEST_PARTIAL_VIEW_NAME);
    console.error = originalConsoleError;
  });

  it("should delete an empty partial view folder", async () => {
    // Arrange - Create empty folder
    await folderBuilder
      .withName(TEST_FOLDER_NAME)
      .create();

    // Verify it exists before deletion
    const existsBeforeDelete = await PartialViewHelper.verifyPartialViewFolder(folderBuilder.getPath());
    expect(existsBeforeDelete).toBe(true);

    const params = {
      path: folderBuilder.getPath()
    };

    // Act
    const result = await DeletePartialViewFolderTool.handler(params, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify the folder no longer exists
    const existsAfterDelete = await PartialViewHelper.verifyPartialViewFolder(folderBuilder.getPath());
    expect(existsAfterDelete).toBe(false);
  });

  it("should handle attempt to delete a non-empty partial view folder", async () => {
    // Arrange - Create folder with partial view inside
    await folderBuilder
      .withName(TEST_FOLDER_NAME)
      .create();

    // Create a partial view inside the folder
    await partialViewBuilder
      .withName(TEST_PARTIAL_VIEW_NAME)
      .withContent(TEST_CONTENT)
      .withParent(folderBuilder.getPath())
      .create();

    // Verify both exist before deletion attempt
    const folderExistsBeforeDelete = await PartialViewHelper.verifyPartialViewFolder(folderBuilder.getPath());
    expect(folderExistsBeforeDelete).toBe(true);
    const partialViewExistsBeforeDelete = await PartialViewHelper.verifyPartialView(partialViewBuilder.getPath());
    expect(partialViewExistsBeforeDelete).toBe(true);

    const params = {
      path: folderBuilder.getPath()
    };

    // Act
    const result = await DeletePartialViewFolderTool.handler(params, { signal: new AbortController().signal });

    // Assert - Error responses don't use createSnapshotResult (folder is not empty)
    expect(result).toMatchSnapshot();

    // Verify the folder and its contents still exist (deletion should have failed)
    const folderExistsAfterDelete = await PartialViewHelper.verifyPartialViewFolder(folderBuilder.getPath());
    expect(folderExistsAfterDelete).toBe(true);
    const partialViewExistsAfterDelete = await PartialViewHelper.verifyPartialView(partialViewBuilder.getPath());
    expect(partialViewExistsAfterDelete).toBe(true);
  });

  it("should handle non-existent partial view folder", async () => {
    // Arrange
    const params = {
      path: NON_EXISTENT_PATH
    };

    // Act
    const result = await DeletePartialViewFolderTool.handler(params, { signal: new AbortController().signal });

    // Assert - Error responses don't use createSnapshotResult
    expect(result).toMatchSnapshot();
  });

});