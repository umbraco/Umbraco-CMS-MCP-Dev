import GetDocumentAncestorsBatchTool from "../items/get/get-ancestors-batch.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-document-ancestors-batch", () => {
  const TEST_ROOT_NAME = "_Test AncestorsBatch Root";
  const TEST_CHILD_NAME = "_Test AncestorsBatch Child";
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_ROOT_NAME);
    await DocumentTestHelper.cleanup(TEST_CHILD_NAME);
  });

  it("should return an ancestor chain for a child document", async () => {
    const parent = await new DocumentBuilder()
      .withName(TEST_ROOT_NAME)
      .withRootDocumentType()
      .create();

    const child = await new DocumentBuilder()
      .withName(TEST_CHILD_NAME)
      .withContentDocumentType()
      .withParent(parent.getId())
      .create();

    const result = await GetDocumentAncestorsBatchTool.handler(
      { id: [child.getId()] },
      createMockRequestHandlerExtra()
    );

    const data = validateToolResponse(GetDocumentAncestorsBatchTool, result);
    expect(data.items).toHaveLength(1);
    expect(data.items[0].ancestors.length).toBeGreaterThan(0);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
