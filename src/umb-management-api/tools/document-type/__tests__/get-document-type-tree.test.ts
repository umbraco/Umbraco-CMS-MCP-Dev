import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
import GetDocumentTypeAncestorsTool from "../items/get/get-ancestors.js";
import GetDocumentTypeChildrenTool from "../items/get/get-children.js";
import GetAllDocumentTypesTool from "../items/get/get-all.js";
import { DocumentTypeFolderBuilder } from "./helpers/document-type-folder-builder.js";
import { DocumentTypeBuilder } from "./helpers/document-type-builder.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("document-type-tree", () => {
  const TEST_ROOT_NAME = "_Test Root DocumentType";
  const TEST_FOLDER_NAME = "_Test Folder DocumentType";
  const TEST_CHILD_NAME = "_Test Child DocumentType";
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTypeTestHelper.cleanup(TEST_ROOT_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_CHILD_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_FOLDER_NAME);
  });

  //can't test root as it will change throughout testing

  describe("children", () => {
    it("should get child items", async () => {
      // Arrange - Create parent folder
      const folderBuilder = await new DocumentTypeFolderBuilder(
        TEST_FOLDER_NAME
      ).create();

      // Arrange - Create child document type
      await new DocumentTypeBuilder()
        .withName(TEST_CHILD_NAME)
        .withParentId(folderBuilder.getId())
        .create();

      // Act - Get children of folder
      const result = await GetDocumentTypeChildrenTool.handler(
        {
          take: 100,
          parentId: folderBuilder.getId(),
        } as any, createMockRequestHandlerExtra()
      );

      // Assert - Verify the children are returned
      expect(createSnapshotResult(result)).toMatchSnapshot();
    });

    it("should handle non-existent parent", async () => {
      // Act - Try to get children of non-existent parent
      const result = await GetDocumentTypeChildrenTool.handler(
        {
          take: 100,
          parentId: BLANK_UUID,
        } as any, createMockRequestHandlerExtra()
      );

      // Assert
      expect(result).toMatchSnapshot();
    });
  });

  describe("ancestors", () => {
    it("should get ancestor items", async () => {
      // Arrange - Create folder structure
      const folderBuilder = await new DocumentTypeFolderBuilder(
        TEST_FOLDER_NAME
      ).create();

      // Arrange - Create child document type
      const childBuilder = await new DocumentTypeBuilder()
        .withName(TEST_CHILD_NAME)
        .withParentId(folderBuilder.getId())
        .create();

      // Act - Get ancestors of child
      const result = await GetDocumentTypeAncestorsTool.handler(
        {
          descendantId: childBuilder.getId(),
        } as any, createMockRequestHandlerExtra()
      );

      // Assert - Verify the ancestors are returned
      expect(createSnapshotResult(result)).toMatchSnapshot();
    });

    it("should handle non-existent item", async () => {
      // Act - Try to get ancestors of non-existent item
      const result = await GetDocumentTypeAncestorsTool.handler(
        {
          descendantId: BLANK_UUID,
        } as any, createMockRequestHandlerExtra()
      );

      // Assert
      expect(result).toMatchSnapshot();
    });
  });

  describe("get-all", () => {
    it("should get all document types including nested children", async () => {
      // Arrange - Create a nested structure:
      // Root Folder
      //   └─ Child Folder
      //       └─ Grandchild Document Type
      const rootFolderBuilder = await new DocumentTypeFolderBuilder(
        TEST_FOLDER_NAME
      ).create();

      const childFolderBuilder = await new DocumentTypeFolderBuilder(
        TEST_CHILD_NAME
      ).withParentId(rootFolderBuilder.getId())
      .create();

      await new DocumentTypeBuilder()
        .withName(TEST_ROOT_NAME)
        .withParentId(childFolderBuilder.getId())
        .create();

      // Act - Get all document types
      const result = await GetAllDocumentTypesTool.handler(
        {} as any, createMockRequestHandlerExtra()
      );

      // Assert - Verify our test structure exists
      const response = validateToolResponse(GetAllDocumentTypesTool, result);
      const items = response.items;
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
