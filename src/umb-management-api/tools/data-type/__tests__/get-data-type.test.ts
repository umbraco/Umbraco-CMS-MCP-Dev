import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import GetDataTypeTool from "../get/get-data-type.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra, validateToolResponse, validateErrorResult } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

describe("get-data-type", () => {
  const TEST_DATATYPE_NAME = "_Test Get DataType";
  setupTestEnvironment();

  afterEach(async () => {
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME);
  });

  it("should get a data type by ID", async () => {
    // Arrange - Create a test data type to get
    const builder = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    // Act - Get the data type by ID
    const result = await GetDataTypeTool.handler(
      { id: builder.getId() },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify the handler response
    validateToolResponse(GetDataTypeTool, result);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should handle non-existent data type", async () => {
    // Act - Try to get non-existent data type
    const result = await GetDataTypeTool.handler(
      { id: BLANK_UUID },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify the error response
    validateErrorResult(result);
    expect(result).toMatchSnapshot();
  });

  it("should handle invalid ID format", async () => {
    // Act - Try to get data type with invalid ID
    const result = await GetDataTypeTool.handler(
      { id: "invalid-id-format" },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify the error response
    validateErrorResult(result);
    expect(result).toMatchSnapshot();
  });
});
