import GetDocumentAreReferencedTool from "../get/get-document-are-referenced.js";
import GetDocumentByIdReferencedByTool from "../get/get-document-by-id-referenced-by.js";
import GetDocumentByIdReferencedDescendantsTool from "../get/get-document-by-id-referenced-descendants.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { jest } from "@jest/globals";

const TEST_DOCUMENT_NAME = "_Test Reference Document";
const TEST_DOCUMENT_NAME_2 = "_Test Reference Document 2";

describe("document-reference-tests", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME_2);
  });

  describe("get-document-are-referenced", () => {
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
      const result = await GetDocumentAreReferencedTool().handler(
        { id: [builder1.getId(), builder2.getId()], take: 20 },
        { signal: new AbortController().signal }
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
      const result = await GetDocumentAreReferencedTool().handler(
        { id: [builder.getId()], skip: 0, take: 10 },
        { signal: new AbortController().signal }
      );

      // Assert: Verify the response
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();
    });

    it("should handle empty reference check", async () => {
      // Act: Check references for empty array
      const result = await GetDocumentAreReferencedTool().handler(
        { id: [], take: 20 },
        { signal: new AbortController().signal }
      );

      // Assert: Should handle gracefully
      expect(result).toMatchSnapshot();
    });
  });

  describe("get-document-by-id-referenced-by", () => {
    it("should get documents that reference a document by ID", async () => {
      // Arrange: Create a document
      const builder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withRootDocumentType()
        .create();

      // Act: Get documents that reference this document
      const result = await GetDocumentByIdReferencedByTool().handler(
        { id: builder.getId(), take: 20 },
        { signal: new AbortController().signal }
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
      const result = await GetDocumentByIdReferencedByTool().handler(
        { id: builder.getId(), skip: 0, take: 10 },
        { signal: new AbortController().signal }
      );

      // Assert: Verify the response
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();
    });

    it("should handle non-existent document", async () => {
      // Act: Try to get references for non-existent document
      const result = await GetDocumentByIdReferencedByTool().handler(
        { id: "00000000-0000-0000-0000-000000000000", take: 20 },
        { signal: new AbortController().signal }
      );

      // Assert: Should handle gracefully
      expect(result).toMatchSnapshot();
    });
  });

  describe("get-document-by-id-referenced-descendants", () => {
    it("should get descendants that are referenced", async () => {
      // Arrange: Create a document
      const builder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withRootDocumentType()
        .create();

      // Act: Get referenced descendants
      const result = await GetDocumentByIdReferencedDescendantsTool().handler(
        { id: builder.getId(), take: 20 },
        { signal: new AbortController().signal }
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
      const result = await GetDocumentByIdReferencedDescendantsTool().handler(
        { id: builder.getId(), skip: 0, take: 10 },
        { signal: new AbortController().signal }
      );

      // Assert: Verify the response
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();
    });

    it("should handle non-existent document", async () => {
      // Act: Try to get referenced descendants for non-existent document
      const result = await GetDocumentByIdReferencedDescendantsTool().handler(
        { id: "00000000-0000-0000-0000-000000000000", take: 20 },
        { signal: new AbortController().signal }
      );

      // Assert: Should handle gracefully
      expect(result).toMatchSnapshot();
    });
  });
});