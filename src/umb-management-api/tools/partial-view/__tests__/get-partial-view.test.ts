import GetPartialViewByPathTool from "../get/get-partial-view-by-path.js";
import GetPartialViewFolderByPathTool from "../get/get-partial-view-folder-by-path.js";
import { PartialViewBuilder } from "./helpers/partial-view-builder.js";
import { PartialViewFolderBuilder } from "./helpers/partial-view-folder-builder.js";
import { PartialViewHelper } from "./helpers/partial-view-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const TEST_PARTIAL_VIEW_NAME = "_TestGetPartialView.cshtml";
const TEST_FOLDER_NAME = "_TestGetPartialViewFolder";
const TEST_CONTENT = "@* Test get content *@\n<div><p>Get Test Content</p></div>";
const NON_EXISTENT_PARTIAL_VIEW_PATH = "/_NonExistentPartialView.cshtml";
const NON_EXISTENT_FOLDER_PATH = "/_NonExistentFolder";

describe("get-partial-view", () => {
  let originalConsoleError: typeof console.error;
  let partialViewBuilder: PartialViewBuilder;
  let folderBuilder: PartialViewFolderBuilder;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    partialViewBuilder = new PartialViewBuilder();
    folderBuilder = new PartialViewFolderBuilder();
  });

  afterEach(async () => {
    await PartialViewHelper.cleanup(TEST_PARTIAL_VIEW_NAME);
    await PartialViewHelper.cleanup(TEST_FOLDER_NAME);
    console.error = originalConsoleError;
  });

  describe("GetPartialViewByPathTool", () => {
    it("should get a partial view by path", async () => {
      // Arrange - Create partial view
      await partialViewBuilder
        .withName(TEST_PARTIAL_VIEW_NAME)
        .withContent(TEST_CONTENT)
        .create();

      const params = {
        path: partialViewBuilder.getPath()
      };

      // Act
      const result = await GetPartialViewByPathTool.handler(params, { signal: new AbortController().signal });

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify response contains expected partial view data
      const responseData = JSON.parse(String(result.content[0].text));
      expect(responseData).toHaveProperty('name', TEST_PARTIAL_VIEW_NAME);
      expect(responseData).toHaveProperty('content', TEST_CONTENT);
      expect(responseData).toHaveProperty('path', partialViewBuilder.getPath());
    });

    it("should get a partial view in a folder", async () => {
      // Arrange - Create folder and partial view inside it
      await folderBuilder
        .withName(TEST_FOLDER_NAME)
        .create();

      await partialViewBuilder
        .withName(TEST_PARTIAL_VIEW_NAME)
        .withContent(TEST_CONTENT)
        .withParent(folderBuilder.getPath())
        .create();

      const params = {
        path: partialViewBuilder.getPath()
      };

      // Act
      const result = await GetPartialViewByPathTool.handler(params, { signal: new AbortController().signal });

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify response contains expected data
      const responseData = JSON.parse(String(result.content[0].text));
      expect(responseData).toHaveProperty('name', TEST_PARTIAL_VIEW_NAME);
      expect(responseData).toHaveProperty('content', TEST_CONTENT);
      expect(responseData.path).toContain(TEST_FOLDER_NAME);
    });

    it("should handle non-existent partial view", async () => {
      // Arrange
      const params = {
        path: NON_EXISTENT_PARTIAL_VIEW_PATH
      };

      // Act
      const result = await GetPartialViewByPathTool.handler(params, { signal: new AbortController().signal });

      // Assert - Error responses don't use createSnapshotResult
      expect(result).toMatchSnapshot();
    });

    it("should handle invalid path format", async () => {
      // Arrange
      const params = {
        path: "invalid/path/without/leading/slash"
      };

      // Act
      const result = await GetPartialViewByPathTool.handler(params, { signal: new AbortController().signal });

      // Assert - Error responses don't use createSnapshotResult
      expect(result).toMatchSnapshot();
    });
  });

  describe("GetPartialViewFolderByPathTool", () => {
    it("should get a partial view folder by path", async () => {
      // Arrange - Create folder
      await folderBuilder
        .withName(TEST_FOLDER_NAME)
        .create();

      const params = {
        path: folderBuilder.getPath()
      };

      // Act
      const result = await GetPartialViewFolderByPathTool.handler(params, { signal: new AbortController().signal });

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify response contains expected folder data
      const responseData = JSON.parse(String(result.content[0].text));
      expect(responseData).toHaveProperty('name', TEST_FOLDER_NAME);
      expect(responseData).toHaveProperty('path', folderBuilder.getPath());
    });

    it("should handle non-existent partial view folder", async () => {
      // Arrange
      const params = {
        path: NON_EXISTENT_FOLDER_PATH
      };

      // Act
      const result = await GetPartialViewFolderByPathTool.handler(params, { signal: new AbortController().signal });

      // Assert - Error responses don't use createSnapshotResult
      expect(result).toMatchSnapshot();
    });

    it("should handle getting folder that is actually a partial view", async () => {
      // Arrange - Create partial view and try to get it as folder
      await partialViewBuilder
        .withName(TEST_PARTIAL_VIEW_NAME)
        .withContent(TEST_CONTENT)
        .create();

      const params = {
        path: partialViewBuilder.getPath()
      };

      // Act
      const result = await GetPartialViewFolderByPathTool.handler(params, { signal: new AbortController().signal });

      // Assert - Error responses don't use createSnapshotResult
      expect(result).toMatchSnapshot();
    });
  });
});