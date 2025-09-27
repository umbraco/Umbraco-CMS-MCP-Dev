import GetCollectionDocumentByIdTool from "../get/get-collection-document-by-id.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { jest } from "@jest/globals";

const TEST_DOCUMENT_NAME = "_Test Collection Document";

describe("get-collection-document-by-id", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
  });

  it("should get collection document by id", async () => {
    // Arrange: Create a document
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();

    // Act: Get collection for the document
    const result = await GetCollectionDocumentByIdTool().handler(
      { id: builder.getId(), take: 10, orderBy: "name" },
      { signal: new AbortController().signal }
    );

    // Assert: Check if this is an error response
    const responseText = result.content[0].text;
    if (typeof responseText === 'string' && responseText.startsWith('Error')) {
      // This is an error response, handle it directly
      expect(result).toMatchSnapshot();
    } else {
      // Normal success response
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();
    }
  });

  it("should get collection document with filters", async () => {
    // Arrange: Create a document
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();

    // Act: Get collection with filter parameters
    const result = await GetCollectionDocumentByIdTool().handler(
      {
        id: builder.getId(),
        filter: "",
        skip: 0,
        take: 10,
        orderBy: "name"
      },
      { signal: new AbortController().signal }
    );

    // Assert: Check if this is an error response
    const responseText = result.content[0].text;
    if (typeof responseText === 'string' && responseText.startsWith('Error')) {
      // This is an error response, handle it directly
      expect(result).toMatchSnapshot();
    } else {
      // Normal success response
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();
    }
  });

  it("should handle non-existent document", async () => {
    // Act: Try to get collection for non-existent document
    const result = await GetCollectionDocumentByIdTool().handler(
      { id: "00000000-0000-0000-0000-000000000000", take: 10, orderBy: "name" },
      { signal: new AbortController().signal }
    );

    // Assert: Should handle gracefully
    expect(result).toMatchSnapshot();
  });
});