import GetDocumentVersionTool from "../get/get-document-version.js";
import { DocumentVersionBuilder } from "./helpers/document-version-builder.js";
import { DocumentVersionVerificationHelper } from "./helpers/document-version-verification-helper.js";
import { createSnapshotResult, normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_DOCUMENT_NAME = "_Test Document for Versions";

describe("get-document-version", () => {
  setupTestEnvironment();
  let documentBuilder: DocumentVersionBuilder;

  afterEach(async () => {
    // Clean up any test documents
    await DocumentVersionVerificationHelper.cleanup(TEST_DOCUMENT_NAME);
  });

  it("should list document versions with pagination", async () => {
    // Arrange
    documentBuilder = new DocumentVersionBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType();

    await documentBuilder.create();
    await documentBuilder.publish();
    await documentBuilder.updateContent(); // Create another version

    // Act
    const result = await GetDocumentVersionTool.handler({
      documentId: documentBuilder.getId(),
      skip: 0,
      take: 10
    }, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle pagination with skip and take", async () => {
    // Arrange
    documentBuilder = new DocumentVersionBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType();

    await documentBuilder.create();
    await documentBuilder.publish();
    await documentBuilder.updateContent(); // Create another version

    // Act
    const result = await GetDocumentVersionTool.handler({
      documentId: documentBuilder.getId(),
      skip: 1,
      take: 1
    }, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle non-existent document", async () => {
    // Act
    const result = await GetDocumentVersionTool.handler({
      documentId: "non-existent-id",
      skip: 0,
      take: 10
    }, createMockRequestHandlerExtra());

    // Assert - Use normalizeErrorResponse for error responses
    expect(result.isError).toBe(true);
    const normalizedResult = normalizeErrorResponse(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});
