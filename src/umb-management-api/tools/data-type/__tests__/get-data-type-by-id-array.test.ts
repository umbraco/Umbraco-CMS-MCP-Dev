import GetDataTypesByIdArrayTool from "../get/get-data-type-by-id-array.js";
import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { getItemDataTypeResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

describe("get-data-type-by-id-array", () => {
  const TEST_DATATYPE_NAME = "_Test Item DataType";
  const TEST_DATATYPE_NAME_2 = "_Test Item DataType2";
  setupTestEnvironment();

  afterEach(async () => {
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME);
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME_2);
  });

  it("should get no data types for empty request", async () => {
    // Act - Get data types with empty ID array
    const result = await GetDataTypesByIdArrayTool.handler(
      {} as any,
      createMockRequestHandlerExtra()
    );

    // Assert - Verify empty response
    validateStructuredContent(result, getItemDataTypeResponse);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should get single data type by ID", async () => {
    // Arrange - Create a data type
    const builder = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    // Act - Get by ID
    const result = await GetDataTypesByIdArrayTool.handler(
      { id: [builder.getId()] },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify the data type is returned
    const items = validateStructuredContent(result, getItemDataTypeResponse);
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe(TEST_DATATYPE_NAME);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should get multiple data types by ID", async () => {
    // Arrange - Create first data type
    const builder1 = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    // Arrange - Create second data type
    const builder2 = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME_2)
      .withTextbox()
      .create();

    // Act - Get by IDs
    const result = await GetDataTypesByIdArrayTool.handler(
      {
        id: [builder1.getId(), builder2.getId()],
      },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify both data types are returned
    const items = validateStructuredContent(result, getItemDataTypeResponse);
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe(TEST_DATATYPE_NAME);
    expect(items[1].name).toBe(TEST_DATATYPE_NAME_2);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
