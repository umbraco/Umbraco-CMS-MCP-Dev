import { StylesheetHelper } from "./helpers/stylesheet-helper.js";
import GetStylesheetAncestorsTool from "../items/get/get-ancestors.js";
import GetStylesheetChildrenTool from "../items/get/get-children.js";
import GetStylesheetRootTool from "../items/get/get-root.js";
import GetStylesheetSearchTool from "../items/get/get-search.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import { StylesheetBuilder } from "./helpers/stylesheet-builder.js";
import { StylesheetFolderBuilder } from "./helpers/stylesheet-folder-builder.js";

describe("stylesheet-tree-operations", () => {
  const TEST_FOLDER_NAME = "_Test Folder";
  const TEST_CHILD_NAME = "_Test Child";
  const TEST_PARENT_NAME = "_Test Parent";
  const TEST_STYLESHEET_NAME = "_TestTreeStylesheet.css";
  const TEST_CONTENT = "/* Tree test */\nbody { margin: 0; }";
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await StylesheetHelper.cleanup(TEST_FOLDER_NAME);
    await StylesheetHelper.cleanup(TEST_CHILD_NAME);
    await StylesheetHelper.cleanup(TEST_PARENT_NAME);
    await StylesheetHelper.cleanup(TEST_STYLESHEET_NAME);
    console.error = originalConsoleError;
  });

  describe("get-root", () => {
    it("should get root level stylesheets", async () => {
      const result = await GetStylesheetRootTool().handler(
        {
          skip: 0,
          take: 100
        },
        { signal: new AbortController().signal }
      );

      // Normalize and verify response
      const normalizedItems = createSnapshotResult(result);
      expect(normalizedItems).toMatchSnapshot();
    });
  });

  describe("get-children", () => {
    it("should get child items of a folder", async () => {
      // Create parent folder
      await new StylesheetFolderBuilder()
        .withName(TEST_FOLDER_NAME)
        .create();

      // Create child items in the folder
      await new StylesheetBuilder()
        .withName(TEST_STYLESHEET_NAME)
        .withContent(TEST_CONTENT)
        .withPath(`/${TEST_FOLDER_NAME}`)
        .create();

      const result = await GetStylesheetChildrenTool().handler(
        {
          parentPath: `/${TEST_FOLDER_NAME}`,
          skip: 0,
          take: 100
        },
        { signal: new AbortController().signal }
      );

      const normalizedItems = createSnapshotResult(result);
      expect(normalizedItems).toMatchSnapshot();
    });
  });

  describe("get-ancestors", () => {
    it("should get ancestors of a nested item", async () => {
      // Create parent folder
      const parentFolder = new StylesheetFolderBuilder()
        .withName(TEST_PARENT_NAME);
      await parentFolder.create();

      // Create child folder
      const childFolder = new StylesheetFolderBuilder()
        .withName(TEST_CHILD_NAME)
        .withPath(parentFolder.getPath());
      await childFolder.create();

      const result = await GetStylesheetAncestorsTool().handler(
        {
          descendantPath: childFolder.getPath()
        },
        { signal: new AbortController().signal }
      );

      const normalizedItems = createSnapshotResult(result);
      expect(normalizedItems).toMatchSnapshot();
    });
  });

  describe("get-search", () => {
    it("should search for stylesheets", async () => {
      // Create a test stylesheet to search for
      await new StylesheetBuilder()
        .withName(TEST_STYLESHEET_NAME)
        .withContent(TEST_CONTENT)
        .create();

      const result = await GetStylesheetSearchTool().handler(
        {
          path: [TEST_STYLESHEET_NAME]
        },
        { signal: new AbortController().signal }
      );

      const normalizedItems = createSnapshotResult(result);
      expect(normalizedItems).toMatchSnapshot();
    });
  });
});