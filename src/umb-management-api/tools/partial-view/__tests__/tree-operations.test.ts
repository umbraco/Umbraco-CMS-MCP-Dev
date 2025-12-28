import { PartialViewHelper } from "./helpers/partial-view-helper.js";
import GetPartialViewAncestorsTool from "../items/get/get-ancestors.js";
import GetPartialViewChildrenTool from "../items/get/get-children.js";
import GetPartialViewRootTool from "../items/get/get-root.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import { PartialViewBuilder } from "./helpers/partial-view-builder.js";
import { PartialViewFolderBuilder } from "./helpers/partial-view-folder-builder.js";

describe("partial-view-tree-operations", () => {
  const TEST_FOLDER_NAME = "_Test Folder";
  const TEST_CHILD_NAME = "_Test Child";
  const TEST_PARENT_NAME = "_Test Parent";
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await PartialViewHelper.cleanup(TEST_FOLDER_NAME);
    await PartialViewHelper.cleanup(TEST_CHILD_NAME);
    await PartialViewHelper.cleanup(TEST_PARENT_NAME);
    console.error = originalConsoleError;
  });

  describe("get-root", () => {
    it("should get root level partial views", async () => {
      const result = await GetPartialViewRootTool.handler(
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
      await new PartialViewFolderBuilder()
        .withName(TEST_FOLDER_NAME)
        .create();

      // Create child partial view in the folder
      await new PartialViewBuilder()
        .withName(TEST_CHILD_NAME)
        .withParent(TEST_FOLDER_NAME)
        .create();

      const result = await GetPartialViewChildrenTool.handler(
        {
          parentPath: TEST_FOLDER_NAME,
          take: 100,
        },
        { signal: new AbortController().signal }
      );

      // Normalize and verify response
      const normalizedItems = createSnapshotResult(result);
      expect(normalizedItems).toMatchSnapshot();
    });

    it("should handle non-existent parent path", async () => {
      const result = await GetPartialViewChildrenTool.handler(
        {
          parentPath: "_NonExistentFolder",
          take: 100,
        },
        { signal: new AbortController().signal }
      );

      expect(result).toMatchSnapshot();
    });
  });

  describe("get-ancestors", () => {
    it("should get ancestor items", async () => {
      // Create parent folder
      await new PartialViewFolderBuilder()
        .withName(TEST_PARENT_NAME)
        .create();

      // Create child partial view in the folder
      const childBuilder = await new PartialViewBuilder()
        .withName(TEST_CHILD_NAME)
        .withParent(TEST_PARENT_NAME)
        .create();

      const result = await GetPartialViewAncestorsTool.handler(
        {
          descendantPath: childBuilder.getPath(),
        },
        { signal: new AbortController().signal }
      );

      // Normalize and verify response
      const normalizedItems = createSnapshotResult(result);
      expect(normalizedItems).toMatchSnapshot();
    });

    it("should handle non-existent descendant path", async () => {
      const result = await GetPartialViewAncestorsTool.handler(
        {
          descendantPath: "_NonExistent/test.cshtml",
        },
        { signal: new AbortController().signal }
      );

      expect(result).toMatchSnapshot();
    });
  });
});