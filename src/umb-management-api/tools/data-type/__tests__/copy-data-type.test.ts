import CopyDataTypeTool from "../post/copy-data-type.js";
import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import { DataTypeFolderBuilder } from "./helpers/data-type-folder-builder.js";
import { jest } from "@jest/globals";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra, validateErrorResult } from "@/test-helpers/create-mock-request-handler-extra.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

const TEST_DATATYPE_NAME = "_Test DataType Copy";
const TEST_DATATYPE_COPY_NAME = "_Test DataType Copy (copy)";
const TEST_FOLDER_NAME = "_Test Folder For Copy";

describe("copy-data-type", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME);
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_COPY_NAME);
    await DataTypeTestHelper.cleanup(TEST_FOLDER_NAME);
    console.error = originalConsoleError;
  });

  it("should copy a data type to a folder", async () => {
    // Arrange - Create a data type to copy
    const dataTypeBuilder = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    // Arrange - Create a target folder
    const folderBuilder = await new DataTypeFolderBuilder(
      TEST_FOLDER_NAME
    ).create();

    // Act - Copy the data type to the folder
    const result = await CopyDataTypeTool.handler(
      {
        id: dataTypeBuilder.getId(),
        body: {
          target: { id: folderBuilder.getId() },
        },
      },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify the handler response
    expect(createSnapshotResult(result)).toMatchSnapshot();

    // Assert - Verify the data type was copied to the folder
    const copiedDataType = await DataTypeTestHelper.findDataType(
      TEST_DATATYPE_COPY_NAME
    );
    expect(copiedDataType).toBeTruthy();
    expect(copiedDataType?.parent?.id).toBe(folderBuilder.getId());
  });

  it("should copy a data type to root", async () => {
    // Arrange - Create a data type to copy
    const dataTypeBuilder = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    // Act - Copy the data type to root (no target)
    const result = await CopyDataTypeTool.handler(
      {
        id: dataTypeBuilder.getId(),
        body: {
          target: null,
        },
      },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify the handler response
    expect(createSnapshotResult(result)).toMatchSnapshot();

    // Assert - Verify the data type was copied to root
    const copiedDataType = await DataTypeTestHelper.findDataType(
      TEST_DATATYPE_COPY_NAME
    );
    expect(copiedDataType).toBeTruthy();
    expect(copiedDataType?.parent).toBeNull();
  });

  it("should handle non-existent data type", async () => {
    // Act - Try to copy non-existent data type
    const result = await CopyDataTypeTool.handler(
      {
        id: BLANK_UUID,
        body: {
          target: null,
        },
      },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify the error response
    validateErrorResult(result);
    expect(result).toMatchSnapshot();
  });
});