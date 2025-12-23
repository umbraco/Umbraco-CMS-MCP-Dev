import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import GetDataTypeAncestorsTool from "../items/get/get-ancestors.js";
import GetDataTypeChildrenTool from "../items/get/get-children.js";
import GetAllDataTypesTool from "../items/get/get-all.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import { DataTypeFolderBuilder } from "./helpers/data-type-folder-builder.js";
import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { DataTypeTreeItemResponseModel } from "@/umb-management-api/schemas/dataTypeTreeItemResponseModel.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { getTreeDataTypeChildrenResponse, getTreeDataTypeAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const TEST_ROOT_NAME = "_Test Root DataType";
const TEST_FOLDER_NAME = "_Test Folder DataType";
const TEST_CHILD_NAME = "_Test Child DataType";

describe("data-type-tree", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await DataTypeTestHelper.cleanup(TEST_ROOT_NAME);
    await DataTypeTestHelper.cleanup(TEST_CHILD_NAME);
    await DataTypeTestHelper.cleanup(TEST_FOLDER_NAME);
    console.error = originalConsoleError;
  });

  describe("children", () => {
    it("should get child items", async () => {
      // Arrange - Create parent folder
      const folderBuilder = await new DataTypeFolderBuilder(
        TEST_FOLDER_NAME
      ).create();

      // Arrange - Create child data type
      await new DataTypeBuilder()
        .withName(TEST_CHILD_NAME)
        .withTextbox()
        .withParentId(folderBuilder.getId())
        .create();

      // Act - Get children of folder
      const result = await GetDataTypeChildrenTool.handler(
        { take: 100, parentId: folderBuilder.getId() } as any,
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the children are returned
      validateStructuredContent(result, getTreeDataTypeChildrenResponse);
      expect(createSnapshotResult(result)).toMatchSnapshot();
    });

    it("should handle non-existent parent", async () => {
      // Act - Try to get children of non-existent parent
      const result = await GetDataTypeChildrenTool.handler(
        { take: 100, parentId: BLANK_UUID } as any,
        createMockRequestHandlerExtra()
      );

      // Assert
      expect(result).toMatchSnapshot();
    });
  });

  describe("ancestors", () => {
    it("should get ancestor items", async () => {
      // Arrange - Create folder structure
      const folderBuilder = await new DataTypeFolderBuilder(
        TEST_FOLDER_NAME
      ).create();

      // Arrange - Create child data type
      const childBuilder = await new DataTypeBuilder()
        .withName(TEST_CHILD_NAME)
        .withTextbox()
        .withParentId(folderBuilder.getId())
        .create();

      // Act - Get ancestors of child
      const result = await GetDataTypeAncestorsTool.handler(
        { descendantId: childBuilder.getId() },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the ancestors are returned
      validateStructuredContent(result, getTreeDataTypeAncestorsResponse);
      expect(createSnapshotResult(result)).toMatchSnapshot();
    });

    it("should handle non-existent item", async () => {
      // Act - Try to get ancestors of non-existent item
      const result = await GetDataTypeAncestorsTool.handler(
        { descendantId: BLANK_UUID },
        createMockRequestHandlerExtra()
      );

      // Assert
      expect(result).toMatchSnapshot();
    });
  });

  describe("get-all", () => {
    it("should get all data types including nested children", async () => {
      // Arrange - Create a nested structure:
      // Root Folder
      //   └─ Child Folder
      //       └─ Grandchild Data Type
      const rootFolderBuilder = await new DataTypeFolderBuilder(
        TEST_FOLDER_NAME
      ).create();

      const childFolderBuilder = await new DataTypeFolderBuilder(
        TEST_CHILD_NAME
      ).withParentId(rootFolderBuilder.getId())
      .create();

      await new DataTypeBuilder()
        .withName(TEST_ROOT_NAME)
        .withTextbox()
        .withParentId(childFolderBuilder.getId())
        .create();

      // Act - Get all data types
      const result = await GetAllDataTypesTool.handler(
        {},
        createMockRequestHandlerExtra()
      );

      // Assert - Verify our test structure exists
      const items: DataTypeTreeItemResponseModel[] = result.structuredContent as any;
      const rootFolder = items.find(item => item.name === TEST_FOLDER_NAME);
      const childFolder = items.find(item => item.name === TEST_CHILD_NAME);
      const grandchild = items.find(item => item.name === TEST_ROOT_NAME);

      expect(rootFolder).toBeDefined();
      expect(childFolder).toBeDefined();
      expect(grandchild).toBeDefined();

      // Assert - Verify the hierarchy
      expect(childFolder?.parent?.id).toBe(rootFolder?.id);
      expect(grandchild?.parent?.id).toBe(childFolder?.id);
    });
  });
});
