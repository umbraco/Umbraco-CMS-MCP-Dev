import GetDocumentTypeTreeSearchTool from "../items/get/get-tree-search.js";
import { DocumentTypeBuilder } from "./helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-document-type-tree-search", () => {
  const TEST_DOCTYPE_NAME = "_Test TreeSearch DocumentType";
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME);
  });

  it("should find a created document type by name in tree-node shape", async () => {
    await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .withIcon("icon-document")
      .create();

    const result = await GetDocumentTypeTreeSearchTool.handler(
      { query: TEST_DOCTYPE_NAME, itemKind: undefined },
      createMockRequestHandlerExtra()
    );

    const data = validateToolResponse(GetDocumentTypeTreeSearchTool, result);
    expect(data.total).toBeGreaterThanOrEqual(1);
    const match = data.items.find((i: any) => i.name === TEST_DOCTYPE_NAME);
    expect(match?.hasChildren).toBeDefined();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
