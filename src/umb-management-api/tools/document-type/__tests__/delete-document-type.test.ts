import DeleteDocumentTypeTool from "../delete/delete-document-type.js";
import { DocumentTypeBuilder } from "./helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
import { createMockRequestHandlerExtra, getResultText } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { BLANK_UUID } from "@/constants/constants.js";

describe("delete-document-type", () => {
  const TEST_DOCTYPE_NAME = "_Test DocumentType Delete";
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any remaining test document types
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME);
  });

  it("should delete a document type", async () => {
    // Create a document type to delete
    const builder = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .create();

    // Delete the document type
    const result = await DeleteDocumentTypeTool.handler(
      {
        id: builder.getId(),
      } as any, createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();

    // Verify the document type no longer exists
    const found = await DocumentTypeTestHelper.findDocumentType(
      TEST_DOCTYPE_NAME
    );
    expect(found).toBeUndefined();
  });

  it("should handle non-existent document type", async () => {
    const result = await DeleteDocumentTypeTool.handler(
      {
        id: BLANK_UUID,
      } as any, createMockRequestHandlerExtra()
    );

    // Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });
});
