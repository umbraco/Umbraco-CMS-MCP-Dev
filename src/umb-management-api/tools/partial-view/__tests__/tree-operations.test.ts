import { PartialViewHelper } from "./helpers/partial-view-helper.js";
import GetPartialViewAncestorsTool from "../items/get/get-ancestors.js";
import GetPartialViewChildrenTool from "../items/get/get-children.js";
import GetPartialViewRootTool from "../items/get/get-root.js";
import { PartialViewBuilder } from "./helpers/partial-view-builder.js";
import { PartialViewFolderBuilder } from "./helpers/partial-view-folder-builder.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("partial-view-tree-operations", () => {
  setupTestEnvironment();

  const TEST_FOLDER_NAME = "_Test Folder";
  const TEST_CHILD_NAME = "_Test Child";
  const TEST_PARENT_NAME = "_Test Parent";

  afterEach(async () => {
    await PartialViewHelper.cleanup(TEST_FOLDER_NAME);
    await PartialViewHelper.cleanup(TEST_CHILD_NAME);
    await PartialViewHelper.cleanup(TEST_PARENT_NAME);
  });

  describe("get-root", () => {
    it("should get root level partial views", async () => {
      const result = await GetPartialViewRootTool.handler(
        {
          skip: 0,
          take: 100
        },
        createMockRequestHandlerExtra()
      );

      // Validate response against tool's output schema
      const data = validateToolResponse(GetPartialViewRootTool, result);
      expect(data).toHaveProperty('items');

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
        } as any,
        createMockRequestHandlerExtra()
      );

      // Validate response against tool's output schema
      const data = validateToolResponse(GetPartialViewChildrenTool, result);
      expect(data).toHaveProperty('items');

      // Normalize and verify response
      const normalizedItems = createSnapshotResult(result);
      expect(normalizedItems).toMatchSnapshot();
    });

    it("should handle non-existent parent path", async () => {
      const result = await GetPartialViewChildrenTool.handler(
        {
          parentPath: "_NonExistentFolder",
          take: 100,
        } as any,
        createMockRequestHandlerExtra()
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
        createMockRequestHandlerExtra()
      );

      // Validate response against tool's output schema
      const data = validateToolResponse(GetPartialViewAncestorsTool, result);
      expect(data).toHaveProperty('items');

      // Normalize and verify response
      const normalizedItems = createSnapshotResult(result);
      expect(normalizedItems).toMatchSnapshot();
    });

    it("should handle non-existent descendant path", async () => {
      const result = await GetPartialViewAncestorsTool.handler(
        {
          descendantPath: "_NonExistent/test.cshtml",
        },
        createMockRequestHandlerExtra()
      );

      expect(result).toMatchSnapshot();
    });
  });
});