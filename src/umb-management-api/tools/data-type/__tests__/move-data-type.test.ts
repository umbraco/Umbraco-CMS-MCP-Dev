import MoveDataTypeTool from "../put/move-data-type.js";
import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { DataTypeFolderBuilder } from "./helpers/data-type-folder-builder.js";
import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra, validateErrorResult } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

const TEST_DATATYPE_NAME = "_Test DataType Move";
const TEST_FOLDER_NAME = "_Test Folder";

describe("move-data-type", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME);
    await DataTypeTestHelper.cleanup(TEST_FOLDER_NAME);
  });

  it("should move a data type", async () => {
    // Arrange - Create a folder
    const folderBuilder = await new DataTypeFolderBuilder(
      TEST_FOLDER_NAME
    ).create();

    // Arrange - Create a data type to move
    const builder = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    // Act - Move the data type
    const result = await MoveDataTypeTool.handler(
      {
        id: builder.getId(),
        body: {
          target: { id: folderBuilder.getId() },
        },
      },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify the handler response
    expect(result).toMatchSnapshot();

    // Assert - Verify the data type was moved
    const found = await DataTypeTestHelper.findDataType(TEST_DATATYPE_NAME);
    expect(found).toBeDefined();
    expect(found!.id).toBe(builder.getId());
  });

  it("should handle moving to non-existent folder", async () => {
    // Arrange - Create a data type to move
    const builder = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    // Use a random UUID that definitely doesn't exist
    // Note: BLANK_UUID (all zeros) has special meaning in Umbraco - it means "root"
    const NON_EXISTENT_FOLDER_ID = "12345678-1234-1234-1234-123456789abc";

    // Act - Try to move to non-existent folder
    const result = await MoveDataTypeTool.handler(
      {
        id: builder.getId(),
        body: {
          target: { id: NON_EXISTENT_FOLDER_ID },
        },
      },
      createMockRequestHandlerExtra()
    );

    // Assert - API returns 404 ParentNotFound error
    validateErrorResult(result);
    expect(result).toMatchSnapshot();
  });

  it("should handle moving non-existent data type", async () => {
    // Act - Try to move non-existent data type
    const result = await MoveDataTypeTool.handler(
      {
        id: BLANK_UUID,
        body: {
          target: { id: BLANK_UUID },
        },
      },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify the error response
    validateErrorResult(result);
    expect(result).toMatchSnapshot();
  });
});
