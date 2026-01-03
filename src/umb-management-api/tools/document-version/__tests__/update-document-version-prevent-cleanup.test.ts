import UpdateDocumentVersionPreventCleanupTool from "../put/update-document-version-prevent-cleanup.js";
import { DocumentVersionBuilder } from "./helpers/document-version-builder.js";
import { DocumentVersionVerificationHelper } from "./helpers/document-version-verification-helper.js";
import { createSnapshotResult, normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_DOCUMENT_NAME = "_Test Document for Prevent Cleanup";

describe("update-document-version-prevent-cleanup", () => {
  setupTestEnvironment();
  let documentBuilder: DocumentVersionBuilder;

  afterEach(async () => {
    // Clean up any test documents
    await DocumentVersionVerificationHelper.cleanup(TEST_DOCUMENT_NAME);
  });

  it("should prevent cleanup for a document version", async () => {
    // Arrange
    documentBuilder = new DocumentVersionBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType();

    await documentBuilder.create();
    await documentBuilder.publish();

    // Get all versions to find a version ID
    const versions = await DocumentVersionVerificationHelper.findDocumentVersions(
      documentBuilder.getId(),
      false
    );

    expect(versions.length).toBeGreaterThan(0);
    const versionId = versions[0].id;

    // Act
    const result = await UpdateDocumentVersionPreventCleanupTool.handler({
      id: versionId,
      preventCleanup: true
    }, createMockRequestHandlerExtra());

    // Assert
    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();
  });

  it("should allow cleanup for a document version", async () => {
    // Arrange
    documentBuilder = new DocumentVersionBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType();

    await documentBuilder.create();
    await documentBuilder.publish();

    // Get all versions to find a version ID
    const versions = await DocumentVersionVerificationHelper.findDocumentVersions(
      documentBuilder.getId(),
      false
    );

    expect(versions.length).toBeGreaterThan(0);
    const versionId = versions[0].id;

    // Act
    const result = await UpdateDocumentVersionPreventCleanupTool.handler({
      id: versionId,
      preventCleanup: false
    }, createMockRequestHandlerExtra());

    // Assert
    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();
  });

  it("should handle non-existent version ID", async () => {
    // Act
    const result = await UpdateDocumentVersionPreventCleanupTool.handler({
      id: "non-existent-version-id",
      preventCleanup: true
    }, createMockRequestHandlerExtra());

    // Assert - Use normalizeErrorResponse for error responses
    expect(result.isError).toBe(true);
    const normalizedResult = normalizeErrorResponse(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});
