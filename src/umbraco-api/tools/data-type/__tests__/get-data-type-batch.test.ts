import GetDataTypeBatchTool from "../get/get-data-type-batch.js";
import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-data-type-batch", () => {
  const TEST_DATATYPE_NAME = "_Test Batch DataType";
  const TEST_DATATYPE_NAME_2 = "_Test Batch DataType2";
  setupTestEnvironment();

  afterEach(async () => {
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME);
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME_2);
  });

  it("should get a single data type with full configuration values", async () => {
    // Arrange
    const builder = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    // Act
    const result = await GetDataTypeBatchTool.handler(
      { id: [builder.getId()] },
      createMockRequestHandlerExtra()
    );

    // Assert
    const data = validateToolResponse(GetDataTypeBatchTool, result);
    expect(data.total).toBe(1);
    expect(data.items).toHaveLength(1);
    expect(data.items[0].name).toBe(TEST_DATATYPE_NAME);
    // Distinguishing field vs the lightweight items endpoint:
    expect(data.items[0].values).toBeDefined();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should get multiple data types in a single request", async () => {
    // Arrange
    const builder1 = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();
    const builder2 = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME_2)
      .withTextbox()
      .create();

    // Act
    const result = await GetDataTypeBatchTool.handler(
      { id: [builder1.getId(), builder2.getId()] },
      createMockRequestHandlerExtra()
    );

    // Assert
    const data = validateToolResponse(GetDataTypeBatchTool, result);
    expect(data.total).toBe(2);
    expect(data.items).toHaveLength(2);
    const names = data.items.map((i: any) => i.name).sort();
    expect(names).toEqual([TEST_DATATYPE_NAME, TEST_DATATYPE_NAME_2].sort());
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
