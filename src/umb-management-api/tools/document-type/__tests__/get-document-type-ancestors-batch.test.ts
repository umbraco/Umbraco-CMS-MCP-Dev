import GetDocumentTypeAncestorsBatchTool from "../items/get/get-ancestors-batch.js";
import { DocumentTypeBuilder } from "./helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-document-type-ancestors-batch", () => {
  const TEST_DOCTYPE_NAME = "_Test AncestorsBatch DocumentType";
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME);
  });

  it("should return an ancestor entry per requested Id", async () => {
    const builder = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .withIcon("icon-document")
      .create();

    const result = await GetDocumentTypeAncestorsBatchTool.handler(
      { id: [builder.getId()] },
      createMockRequestHandlerExtra()
    );

    const data = validateToolResponse(GetDocumentTypeAncestorsBatchTool, result);
    expect(data.items).toHaveLength(1);
    expect(Array.isArray(data.items[0].ancestors)).toBe(true);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
