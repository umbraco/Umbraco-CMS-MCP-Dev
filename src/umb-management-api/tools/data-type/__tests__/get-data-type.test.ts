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
  let dataTypeId: string;
  let originalConsoleError: typeof console.error;

  beforeAll(async () => {
    // Create a test data type to get
    const builder = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withEditorAlias("Umbraco.TextBox")
      .withEditorUiAlias("Umb.PropertyEditorUi.TextBox")
      .create();

    dataTypeId = builder.getId();
  });

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  afterAll(async () => {
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME);
  });

  it("should get a data type by ID", async () => {
    const result = await GetDataTypeTool.handler(
      {
        id: dataTypeId,
      },
      createMockRequestHandlerExtra()
    );

    validateStructuredContent(result, getDataTypeByIdResponse);

    // Use createSnapshotResult to normalize for snapshot testing
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should handle non-existent data type", async () => {
    const result = await GetDataTypeTool.handler(
      {
        id: BLANK_UUID,
      },
      createMockRequestHandlerExtra()
    );

    validateErrorResult(result);
    expect(result).toMatchSnapshot();
  });

  it("should handle invalid ID format", async () => {
    const result = await GetDataTypeTool.handler(
      {
        id: "invalid-id-format",
      },
      createMockRequestHandlerExtra()
    );

    validateErrorResult(result);
    expect(result).toMatchSnapshot();
  });
});
