import DeleteDataTypeTool from "../delete/delete-data-type.js";
import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra, validateErrorResult } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("delete-data-type", () => {
  const TEST_DATATYPE_NAME = "_Test DataType Delete";
  setupTestEnvironment();

  afterEach(async () => {
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME);
  });

  it("should delete a data type", async () => {
    // Arrange - Create a data type to delete
    const builder = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    // Act - Delete the data type
    const result = await DeleteDataTypeTool.handler(
      { id: builder.getId() },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify the handler response
    expect(result).toMatchSnapshot();

    // Assert - Verify the data type no longer exists
    const found = await DataTypeTestHelper.findDataType(TEST_DATATYPE_NAME);
    expect(found).toBeUndefined();
  });

  it("should handle non-existent data type", async () => {
    // Act - Try to delete non-existent data type
    const result = await DeleteDataTypeTool.handler(
      { id: BLANK_UUID },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify the error response
    validateErrorResult(result);
    expect(result).toMatchSnapshot();
  });
});
