import GetRecycleBinDocumentByIdOriginalParentTool from "../get/get-recycle-bin-document-original-parent.js";
import GetRecycleBinDocumentReferencedByTool from "../get/get-recycle-bin-document-referenced-by.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { jest } from "@jest/globals";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_DOCUMENT_NAME = "_Test Recycle Bin Document";

describe("recycle-bin-reference-tests", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    // Clean up both regular and recycle bin documents
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    await DocumentTestHelper.emptyRecycleBin();
    console.error = originalConsoleError;
  });

  describe("get-recycle-bin-document-original-parent", () => {
    it("should get original parent for recycled document", async () => {
      // Arrange: Create and delete a document to move it to recycle bin
      const builder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withRootDocumentType()
        .create();

      // Delete the document to move to recycle bin
      await builder.moveToRecycleBin();

      // Find the document in recycle bin
      const recycleBinDocument = await DocumentTestHelper.findDocumentInRecycleBin(TEST_DOCUMENT_NAME);
      expect(recycleBinDocument).toBeDefined();

      // Act: Get original parent for the recycled document
      const result = await GetRecycleBinDocumentByIdOriginalParentTool.handler(
        { id: recycleBinDocument!.id },
        createMockRequestHandlerExtra()
      );

      // Assert: Verify the response (might be null if no original parent)
      const data = result.structuredContent;
      if (data === null || data === undefined) {
        // Handle null response - no original parent found
        expect(result).toMatchSnapshot();
      } else {
        const normalizedResult = createSnapshotResult(result);
        expect(normalizedResult).toMatchSnapshot();
      }
    });

    it("should handle non-existent recycled document", async () => {
      // Act: Try to get original parent for non-existent recycled document
      const result = await GetRecycleBinDocumentByIdOriginalParentTool.handler(
        { id: "00000000-0000-0000-0000-000000000000" },
        createMockRequestHandlerExtra()
      );

      // Assert: Should handle gracefully
      expect(result).toMatchSnapshot();
    });
  });

  describe("get-recycle-bin-document-referenced-by", () => {
    it("should get references for recycled document", async () => {
      // Arrange: Create and delete a document to move it to recycle bin
      const builder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withRootDocumentType()
        .create();

      // Delete the document to move to recycle bin
      await builder.moveToRecycleBin();

      // Find the document in recycle bin
      const recycleBinDocument = await DocumentTestHelper.findDocumentInRecycleBin(TEST_DOCUMENT_NAME);
      expect(recycleBinDocument).toBeDefined();

      // Act: Get references for the recycled document
      const result = await GetRecycleBinDocumentReferencedByTool.handler(
        { take: 20, skip: 0 },
        createMockRequestHandlerExtra()
      );

      // Assert: Verify the response
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();
    });

    it("should get references with pagination for recycled document", async () => {
      // Arrange: Create and delete a document to move it to recycle bin
      const builder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withRootDocumentType()
        .create();

      // Delete the document to move to recycle bin
      await builder.moveToRecycleBin();

      // Find the document in recycle bin
      const recycleBinDocument = await DocumentTestHelper.findDocumentInRecycleBin(TEST_DOCUMENT_NAME);
      expect(recycleBinDocument).toBeDefined();

      // Act: Get references with pagination
      const result = await GetRecycleBinDocumentReferencedByTool.handler(
        { skip: 0, take: 10 },
        createMockRequestHandlerExtra()
      );

      // Assert: Verify the response
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();
    });

    it("should handle non-existent recycled document", async () => {
      // Act: Try to get references for non-existent recycled document
      const result = await GetRecycleBinDocumentReferencedByTool.handler(
        { take: 20, skip: 0 },
        createMockRequestHandlerExtra()
      );

      // Assert: Should handle gracefully
      expect(result).toMatchSnapshot();
    });
  });
});