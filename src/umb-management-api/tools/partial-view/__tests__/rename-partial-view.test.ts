import RenamePartialViewTool from "../put/rename-partial-view.js";
import { PartialViewBuilder } from "./helpers/partial-view-builder.js";
import { PartialViewFolderBuilder } from "./helpers/partial-view-folder-builder.js";
import { PartialViewHelper } from "./helpers/partial-view-helper.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_PARTIAL_VIEW_NAME = "_TestRenamePartialView.cshtml";
const TEST_RENAMED_NAME = "_TestRenamedPartialView.cshtml";
const TEST_CONTENT = "@* Test rename content *@\n<div><p>Rename Test Content</p></div>";
const TEST_FOLDER_NAME = "_TestRenameFolder";

describe("rename-partial-view", () => {
  setupTestEnvironment();

  let partialViewBuilder: PartialViewBuilder;
  let folderBuilder: PartialViewFolderBuilder;

  beforeEach(() => {
    partialViewBuilder = new PartialViewBuilder();
    folderBuilder = new PartialViewFolderBuilder();
  });

  afterEach(async () => {
    await PartialViewHelper.cleanup(TEST_PARTIAL_VIEW_NAME);
    await PartialViewHelper.cleanup(TEST_RENAMED_NAME);
    await PartialViewHelper.cleanup(TEST_FOLDER_NAME);
  });

  it("should rename a partial view", async () => {
    // Arrange - Create partial view to rename
    await partialViewBuilder
      .withName(TEST_PARTIAL_VIEW_NAME)
      .withContent(TEST_CONTENT)
      .create();

    // Verify it exists before renaming
    const existsBeforeRename = await PartialViewHelper.verifyPartialView(partialViewBuilder.getPath());
    expect(existsBeforeRename).toBe(true);

    const params = {
      path: partialViewBuilder.getPath(),
      data: {
        name: TEST_RENAMED_NAME
      }
    };

    // Act
    const result = await RenamePartialViewTool.handler(params, createMockRequestHandlerExtra());

    // Assert
    expect(result).toMatchSnapshot();

    // Verify the old partial view no longer exists
    const oldExists = await PartialViewHelper.verifyPartialView(partialViewBuilder.getPath());
    expect(oldExists).toBe(false);

    // Verify the new partial view exists
    const newPath = partialViewBuilder.getPath().replace(TEST_PARTIAL_VIEW_NAME, TEST_RENAMED_NAME);
    const newExists = await PartialViewHelper.verifyPartialView(newPath);
    expect(newExists).toBe(true);
  });

  it("should rename a partial view in a folder", async () => {
    // Arrange - Create folder and partial view inside it
    await folderBuilder
      .withName(TEST_FOLDER_NAME)
      .create();

    await partialViewBuilder
      .withName(TEST_PARTIAL_VIEW_NAME)
      .withContent(TEST_CONTENT)
      .withParent(folderBuilder.getPath())
      .create();

    // Verify it exists before renaming
    const existsBeforeRename = await PartialViewHelper.verifyPartialView(partialViewBuilder.getPath());
    expect(existsBeforeRename).toBe(true);

    const params = {
      path: partialViewBuilder.getPath(),
      data: {
        name: TEST_RENAMED_NAME
      }
    };

    // Act
    const result = await RenamePartialViewTool.handler(params, createMockRequestHandlerExtra());

    // Assert
    expect(result).toMatchSnapshot();

    // Verify the old partial view no longer exists
    const oldExists = await PartialViewHelper.verifyPartialView(partialViewBuilder.getPath());
    expect(oldExists).toBe(false);

    // Verify the new partial view exists in the same folder
    const newPath = `${folderBuilder.getPath()}/${TEST_RENAMED_NAME}`;
    const newExists = await PartialViewHelper.verifyPartialView(newPath);
    expect(newExists).toBe(true);
  });

  it("should rename a partial view folder", async () => {
    // Arrange - Create folder
    await folderBuilder
      .withName(TEST_FOLDER_NAME)
      .create();

    const params = {
      path: folderBuilder.getPath(),
      data: {
        name: "_RenamedFolder"
      }
    };

    // Act
    const result = await RenamePartialViewTool.handler(params, createMockRequestHandlerExtra());

    // Assert
    expect(result).toMatchSnapshot();
  });

  it("should handle non-existent partial view", async () => {
    // Arrange
    const params = {
      path: "/NonExistentPartialView.cshtml",
      data: {
        name: "NewName.cshtml"
      }
    };

    // Act
    const result = await RenamePartialViewTool.handler(params, createMockRequestHandlerExtra());

    // Assert - Error responses don't use createSnapshotResult
    expect(result).toMatchSnapshot();
  });

});