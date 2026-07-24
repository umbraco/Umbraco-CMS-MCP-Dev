import GetDocumentTypeAllowedParentsTool from "../get/get-document-type-allowed-parents.js";
import { DocumentTypeBuilder } from "./helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-document-type-allowed-parents", () => {
  const TEST_DOCTYPE_NAME = "_Test AllowedParents DocumentType";
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME);
  });

  it("should return an allowedParentIds array for a document type", async () => {
    const builder = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .withIcon("icon-document")
      .create();

    const result = await GetDocumentTypeAllowedParentsTool.handler(
      { id: builder.getId() },
      createMockRequestHandlerExtra()
    );

    const data = validateToolResponse(GetDocumentTypeAllowedParentsTool, result);
    expect(Array.isArray(data.allowedParentIds)).toBe(true);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
