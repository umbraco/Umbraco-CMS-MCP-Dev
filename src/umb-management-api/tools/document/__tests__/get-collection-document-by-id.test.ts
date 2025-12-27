import GetCollectionDocumentByIdTool from "../get/get-collection-document-by-id.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_DOCUMENT_NAME = "_Test Collection Document";

describe("get-collection-document-by-id", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
  });

  it("should get collection document by id", async () => {
    // Arrange: Create a document
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();

    // Act: Get collection for the document
    const result = await GetCollectionDocumentByIdTool.handler(
      { id: builder.getId(), take: 10, orderBy: "name" },
      createMockRequestHandlerExtra()
    );

    // Assert: Check if this is an error response
    if (result.isError) {
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
    const result = await GetCollectionDocumentByIdTool.handler(
      {
        id: builder.getId(),
        filter: "",
        skip: 0,
        take: 10,
        orderBy: "name"
      },
      createMockRequestHandlerExtra()
    );

    // Assert: Check if this is an error response
    if (result.isError) {
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
    const result = await GetCollectionDocumentByIdTool.handler(
      { id: "00000000-0000-0000-0000-000000000000", take: 10, orderBy: "name" },
      createMockRequestHandlerExtra()
    );

    // Assert: Should handle gracefully
    expect(result).toMatchSnapshot();
  });
});