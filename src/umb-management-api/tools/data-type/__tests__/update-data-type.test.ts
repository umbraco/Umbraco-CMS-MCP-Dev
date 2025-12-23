import UpdateDataTypeTool from "../put/update-data-type.js";
import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import { jest } from "@jest/globals";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra, validateErrorResult } from "@/test-helpers/create-mock-request-handler-extra.js";

describe("update-data-type", () => {
  const TEST_DATATYPE_NAME = "_Test DataType Update";
  const UPDATED_DATATYPE_NAME = "_Test DataType Updated";
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME);
    await DataTypeTestHelper.cleanup(UPDATED_DATATYPE_NAME);
    console.error = originalConsoleError;
  });

  it("should update a data type", async () => {
    // Arrange - Create a data type to update
    const builder = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    // Arrange - Create update model using builder
    const updateModel = new DataTypeBuilder()
      .withName(UPDATED_DATATYPE_NAME)
      .withTextbox()
      .withValue("maxChars", 100)
      .build();

    // Act - Update the data type
    const result = await UpdateDataTypeTool.handler(
      {
        id: builder.getId(),
        data: {
          name: updateModel.name,
          editorAlias: updateModel.editorAlias,
          editorUiAlias: updateModel.editorUiAlias,
          values: updateModel.values,
        },
      },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify the handler response
    expect(result).toMatchSnapshot();

    // Assert - Verify the data type was updated
    const found = await DataTypeTestHelper.findDataType(UPDATED_DATATYPE_NAME);
    expect(found).toBeDefined();
    expect(found!.id).toBe(builder.getId());
  });

  it("should handle non-existent data type", async () => {
    // Arrange - Create update model
    const updateModel = new DataTypeBuilder()
      .withName(UPDATED_DATATYPE_NAME)
      .withTextbox()
      .withValue("maxChars", 100)
      .build();

    // Act - Try to update non-existent data type
    const result = await UpdateDataTypeTool.handler(
      {
        id: BLANK_UUID,
        data: {
          name: updateModel.name,
          editorAlias: updateModel.editorAlias,
          editorUiAlias: updateModel.editorUiAlias,
          values: updateModel.values,
        },
      },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify the error response
    validateErrorResult(result);
    expect(result).toMatchSnapshot();
  });
});
