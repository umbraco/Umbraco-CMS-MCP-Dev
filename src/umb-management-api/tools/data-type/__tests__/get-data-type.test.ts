import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import GetDataTypeTool from "../get/get-data-type.js";
import { jest } from "@jest/globals";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra, validateStructuredContent, validateErrorResult } from "@/test-helpers/create-mock-request-handler-extra.js";
import { getDataTypeByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

describe("get-data-type", () => {
  const TEST_DATATYPE_NAME = "_Test Get DataType";
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME);
    console.error = originalConsoleError;
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
    validateStructuredContent(result, getDataTypeByIdResponse);
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
