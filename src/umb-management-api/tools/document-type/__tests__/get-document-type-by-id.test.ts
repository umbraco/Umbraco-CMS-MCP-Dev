import GetDocumentTypeTool from "../get/get-document-type-by-ids.js";
import { DocumentTypeBuilder } from "./helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { getDocumentTypeByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra, validateStructuredContent, validateErrorResult } from "@/test-helpers/create-mock-request-handler-extra.js";

describe("get-document-type", () => {
  const TEST_DOCTYPE_NAME = "_Test DocumentType Get";
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME);
  });

  it("should get a document type by id", async () => {
    // Arrange - Create a document type to get
    const builder = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .create();

    // Act - Get the document type
    const result = await GetDocumentTypeTool.handler(
      {
        id: builder.getId(),
      } as any, createMockRequestHandlerExtra()
    );

    // Assert - Verify structured content is valid
    validateStructuredContent(result, getDocumentTypeByIdResponse);

    // Assert - Verify the handler response using snapshot
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should handle non-existent document type", async () => {
    // Act - Try to get non-existent document type
    const result = await GetDocumentTypeTool.handler(
      {
        id: BLANK_UUID,
      } as any, createMockRequestHandlerExtra()
    );

    // Assert - Verify error response
    validateErrorResult(result);
    expect(result).toMatchSnapshot();
  });
});
