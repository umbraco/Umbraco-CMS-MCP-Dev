import GetDocumentTypeBatchTool from "../get/get-document-type-batch.js";
import { DocumentTypeBuilder } from "./helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-document-type-batch", () => {
  const TEST_DOCTYPE_NAME = "_Test Batch DocumentType";
  const TEST_DOCTYPE_NAME_2 = "_Test Batch DocumentType2";
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME_2);
  });

  it("should get a single document type with full configuration", async () => {
    // Arrange
    const builder = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .withIcon("icon-document")
      .create();

    // Act
    const result = await GetDocumentTypeBatchTool.handler(
      { id: [builder.getId()] },
      createMockRequestHandlerExtra()
    );

    // Assert
    const data = validateToolResponse(GetDocumentTypeBatchTool, result);
    expect(data.total).toBe(1);
    expect(data.items).toHaveLength(1);
    expect(data.items[0].name).toBe(TEST_DOCTYPE_NAME);
    // Distinguishing fields vs the lightweight items endpoint:
    expect(data.items[0].properties).toBeDefined();
    expect(data.items[0].compositions).toBeDefined();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should get multiple document types in a single request", async () => {
    // Arrange
    const builder1 = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .withIcon("icon-document")
      .create();
    const builder2 = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME_2)
      .withIcon("icon-document")
      .create();

    // Act
    const result = await GetDocumentTypeBatchTool.handler(
      { id: [builder1.getId(), builder2.getId()] },
      createMockRequestHandlerExtra()
    );

    // Assert
    const data = validateToolResponse(GetDocumentTypeBatchTool, result);
    expect(data.total).toBe(2);
    expect(data.items).toHaveLength(2);
    const names = data.items.map((i: any) => i.name).sort();
    expect(names).toEqual([TEST_DOCTYPE_NAME, TEST_DOCTYPE_NAME_2].sort());
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
