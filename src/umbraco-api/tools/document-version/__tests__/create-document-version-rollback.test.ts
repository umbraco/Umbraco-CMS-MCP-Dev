import CreateDocumentVersionRollbackTool from "../post/create-document-version-rollback.js";
import { DocumentVersionBuilder } from "./helpers/document-version-builder.js";
import { DocumentVersionVerificationHelper } from "./helpers/document-version-verification-helper.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import {
  createMockRequestHandlerExtra,
  normalizeErrorResponse,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DOCUMENT_NAME = "_Test Document for Rollback";
const TEST_VARIANT_DOCUMENT_TYPE_NAME = "_Test Variant DocType for Rollback";

describe("create-document-version-rollback", () => {
  setupTestEnvironment();
  let documentBuilder: DocumentVersionBuilder;

  afterEach(async () => {
    // Clean up any test documents
    await DocumentVersionVerificationHelper.cleanup(TEST_DOCUMENT_NAME);
    await DocumentVersionVerificationHelper.cleanup(TEST_DOCUMENT_NAME + " With Culture");
    // Clean up the variant document type (must be after document cleanup)
    await DocumentTypeTestHelper.cleanup(TEST_VARIANT_DOCUMENT_TYPE_NAME);
  });

  it("should rollback document to a specific version", async () => {
    // Arrange
    documentBuilder = new DocumentVersionBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType();

    await documentBuilder.create();
    await documentBuilder.publish();
    await documentBuilder.updateContent(); // Create another version

    // Get all versions to find a version ID to rollback to
    const versions = await DocumentVersionVerificationHelper.findDocumentVersions(
      documentBuilder.getId(),
      false
    );

    expect(versions.length).toBeGreaterThan(0);
    const versionId = versions[0].id;

    // Act
    const result = await CreateDocumentVersionRollbackTool.handler({
      id: versionId,
      culture: undefined
    }, createMockRequestHandlerExtra());

    // Assert
    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();
  });

  it("should rollback document to a specific version with culture", async () => {
    // Arrange - Create a document type that varies by culture
    const variantDocTypeBuilder = new DocumentTypeBuilder()
      .withName(TEST_VARIANT_DOCUMENT_TYPE_NAME)
      .allowAsRoot(true)
      .variesByCulture(true);

    await variantDocTypeBuilder.create();
    const variantDocTypeId = variantDocTypeBuilder.getId();

    // Create a document with the variant document type and culture
    // Note: withCulture must be called BEFORE withName to set culture correctly
    documentBuilder = new DocumentVersionBuilder()
      .withDocumentType(variantDocTypeId)
      .withCulture("en-US")
      .withName(TEST_DOCUMENT_NAME + " With Culture");

    await documentBuilder.create();
    await documentBuilder.publish();
    await documentBuilder.updateContent();
    await documentBuilder.publish(); // Publish again to create a version history

    // Get all versions to find a version ID to rollback to
    // For variant documents, we need to pass the culture to get versions
    const versions = await DocumentVersionVerificationHelper.findDocumentVersions(
      documentBuilder.getId(),
      false,
      "en-US"
    );

    expect(versions.length).toBeGreaterThan(0);
    const versionId = versions[0].id;

    // Act
    const result = await CreateDocumentVersionRollbackTool.handler({
      id: versionId,
      culture: "en-US"
    }, createMockRequestHandlerExtra());

    // Assert
    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();
  });

  it("should handle non-existent version ID", async () => {
    // Act
    const result = await CreateDocumentVersionRollbackTool.handler({
      id: "non-existent-version-id",
      culture: undefined
    }, createMockRequestHandlerExtra());

    // Assert - Use normalizeErrorResponse for error responses
    expect(result.isError).toBe(true);
    const normalizedResult = normalizeErrorResponse(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});
