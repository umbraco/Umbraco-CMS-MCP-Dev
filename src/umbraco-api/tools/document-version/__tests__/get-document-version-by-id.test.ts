import GetDocumentVersionByIdTool from "../get/get-document-version-by-id.js";
import { DocumentVersionBuilder } from "./helpers/document-version-builder.js";
import { DocumentVersionVerificationHelper } from "./helpers/document-version-verification-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  normalizeErrorResponse,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DOCUMENT_NAME = "_Test Document for Version By ID";

describe("get-document-version-by-id", () => {
  setupTestEnvironment();
  let documentBuilder: DocumentVersionBuilder;

  afterEach(async () => {
    // Clean up any test documents
    await DocumentVersionVerificationHelper.cleanup(TEST_DOCUMENT_NAME);
  });

  it("should get document version by ID", async () => {
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
    const result = await GetDocumentVersionByIdTool.handler({
      id: versionId
    }, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result, versionId);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle non-existent version ID", async () => {
    // Act
    const result = await GetDocumentVersionByIdTool.handler({
      id: "non-existent-version-id"
    }, createMockRequestHandlerExtra());

    // Assert - Use normalizeErrorResponse for error responses
    expect(result.isError).toBe(true);
    const normalizedResult = normalizeErrorResponse(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});
