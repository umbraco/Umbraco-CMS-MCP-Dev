import GetDataTypeAncestorsBatchTool from "../items/get/get-ancestors-batch.js";
import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-data-type-ancestors-batch", () => {
  const TEST_DATATYPE_NAME = "_Test AncestorsBatch DataType";
  setupTestEnvironment();

  afterEach(async () => {
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME);
  });

  it("should return an ancestor entry per requested Id", async () => {
    // Arrange
    const builder = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    // Act
    const result = await GetDataTypeAncestorsBatchTool.handler(
      { id: [builder.getId()] },
      createMockRequestHandlerExtra()
    );

    // Assert
    const data = validateToolResponse(GetDataTypeAncestorsBatchTool, result);
    expect(data.items).toHaveLength(1);
    expect(Array.isArray(data.items[0].ancestors)).toBe(true);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
