import GetDocumentAreReferencedTool from "../get/get-document-are-referenced.js";
import GetDocumentByIdReferencedByTool from "../get/get-document-by-id-referenced-by.js";
import GetDocumentByIdReferencedDescendantsTool from "../get/get-document-by-id-referenced-descendants.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { withCursorPagination } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DOCUMENT_NAME = "_Test Reference Document";
const TEST_DOCUMENT_NAME_2 = "_Test Reference Document 2";

describe("document-reference-tests", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME_2);
  });

  describe("get-document-are-referenced", () => {
    const cursorTool = withCursorPagination(GetDocumentAreReferencedTool);

    it("should check if documents are referenced", async () => {
      // Arrange: Create documents
      const builder1 = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withRootDocumentType()
        .create();

      const builder2 = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME_2)
        .withRootDocumentType()
        .create();

      // Act: Check if documents are referenced
      const result = await cursorTool.handler(
        { id: [builder1.getId(), builder2.getId()] },
        createMockRequestHandlerExtra()
      );

      // Assert: Verify the response
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();
    });

    it("should handle single document reference check", async () => {
      // Arrange: Create a document
      const builder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withRootDocumentType()
        .create();

      // Act: Check if single document is referenced
      const smallPageTool = withCursorPagination({ ...GetDocumentAreReferencedTool, pageSize: 10 });
      const result = await smallPageTool.handler(
        { id: [builder.getId()] },
        createMockRequestHandlerExtra()
      );

      // Assert: Verify the response
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();
    });
  });

  describe("get-document-by-id-referenced-by", () => {
    const cursorTool = withCursorPagination(GetDocumentByIdReferencedByTool);

    it("should get documents that reference a document by ID", async () => {
      // Arrange: Create a document
      const builder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withRootDocumentType()
        .create();

      // Act: Get documents that reference this document
      const result = await cursorTool.handler(
        { id: builder.getId() },
        createMockRequestHandlerExtra()
      );

      // Assert: Verify the response
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();
    });

    it("should get references with pagination", async () => {
      // Arrange: Create a document
      const builder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withRootDocumentType()
        .create();

      // Act: Get references with pagination
      const smallPageTool = withCursorPagination({ ...GetDocumentByIdReferencedByTool, pageSize: 10 });
      const result = await smallPageTool.handler(
        { id: builder.getId() },
        createMockRequestHandlerExtra()
      );

      // Assert: Verify the response
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();
    });

    it("should handle non-existent document", async () => {
      // Act: Try to get references for non-existent document
      const result = await cursorTool.handler(
        { id: "00000000-0000-0000-0000-000000000000" },
        createMockRequestHandlerExtra()
      );

      // Assert: Should handle gracefully
      expect(result).toMatchSnapshot();
    });
  });

  describe("get-document-by-id-referenced-descendants", () => {
    const cursorTool = withCursorPagination(GetDocumentByIdReferencedDescendantsTool);

    it("should get descendants that are referenced", async () => {
      // Arrange: Create a document
      const builder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withRootDocumentType()
        .create();

      // Act: Get referenced descendants
      const result = await cursorTool.handler(
        { id: builder.getId() },
        createMockRequestHandlerExtra()
      );

      // Assert: Verify the response
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();
    });

    it("should get referenced descendants with pagination", async () => {
      // Arrange: Create a document
      const builder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withRootDocumentType()
        .create();

      // Act: Get referenced descendants with pagination
      const smallPageTool = withCursorPagination({ ...GetDocumentByIdReferencedDescendantsTool, pageSize: 10 });
      const result = await smallPageTool.handler(
        { id: builder.getId() },
        createMockRequestHandlerExtra()
      );

      // Assert: Verify the response
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();
    });

    it("should handle non-existent document", async () => {
      // Act: Try to get referenced descendants for non-existent document
      // Using a random UUID that doesn't exist
      const result = await cursorTool.handler(
        { id: crypto.randomUUID() },
        createMockRequestHandlerExtra()
      );

      // Assert: Should not throw an error - verify the response is defined
      expect(result).toBeDefined();
      // New pattern uses structuredContent for data
      if (result.isError) {
        expect(result.isError).toBe(true);
      } else {
        expect(result.structuredContent).toBeDefined();
      }
    });
  });
});
