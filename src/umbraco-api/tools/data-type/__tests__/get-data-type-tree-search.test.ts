import GetDataTypeTreeSearchTool from "../items/get/get-tree-search.js";
import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-data-type-tree-search", () => {
  const TEST_DATATYPE_NAME = "_Test TreeSearch DataType";
  setupTestEnvironment();

  afterEach(async () => {
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME);
  });

  it("should find a created data type by name in tree-node shape", async () => {
    // Arrange
    await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    // Act
    const result = await GetDataTypeTreeSearchTool.handler(
      { query: TEST_DATATYPE_NAME, itemKind: undefined },
      createMockRequestHandlerExtra()
    );

    // Assert
    const data = validateToolResponse(GetDataTypeTreeSearchTool, result);
    expect(data.total).toBeGreaterThanOrEqual(1);
    expect(data.items.some((i: any) => i.name === TEST_DATATYPE_NAME)).toBe(true);
    // Tree-node shape includes hasChildren — distinguishes from item search.
    const match = data.items.find((i: any) => i.name === TEST_DATATYPE_NAME);
    expect(match?.hasChildren).toBeDefined();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
