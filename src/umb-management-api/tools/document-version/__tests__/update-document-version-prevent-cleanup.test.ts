import UpdateDocumentVersionPreventCleanupTool from "../put/update-document-version-prevent-cleanup.js";
import { DocumentVersionBuilder } from "./helpers/document-version-builder.js";
import { DocumentVersionVerificationHelper } from "./helpers/document-version-verification-helper.js";
import { createSnapshotResult, normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const TEST_DOCUMENT_NAME = "_Test Document for Prevent Cleanup";

describe("update-document-version-prevent-cleanup", () => {
  let originalConsoleError: typeof console.error;
  let documentBuilder: DocumentVersionBuilder;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    // Clean up any test documents
    await DocumentVersionVerificationHelper.cleanup(TEST_DOCUMENT_NAME);
    console.error = originalConsoleError;
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
    }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result, versionId);
    expect(normalizedResult).toMatchSnapshot();
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
    }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result, versionId);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle non-existent version ID", async () => {
    // Act
    const result = await UpdateDocumentVersionPreventCleanupTool.handler({
      id: "non-existent-version-id",
      preventCleanup: true
    }, { signal: new AbortController().signal });

    // Assert - Use normalizeErrorResponse for error responses
    const normalizedResult = normalizeErrorResponse(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});