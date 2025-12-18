import CopyDataTypeTool from "../post/copy-data-type.js";
import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import { DataTypeFolderBuilder } from "./helpers/data-type-folder-builder.js";
import { jest } from "@jest/globals";
import { BLANK_UUID } from "@/constants/constants.js";

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
    // Clean up any test data types and folders
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME);
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_COPY_NAME);
    await DataTypeTestHelper.cleanup(TEST_FOLDER_NAME);
    console.error = originalConsoleError;
  });

  it("should copy a data type to a folder", async () => {
    // Create a data type to copy
    const dataTypeBuilder = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    // Create a target folder
    const folderBuilder = await new DataTypeFolderBuilder(
      TEST_FOLDER_NAME
    ).create();

    // Copy the data type
    const result = await CopyDataTypeTool.handler(
      {
        id: dataTypeBuilder.getId(),
        body: {
          target: {
            id: folderBuilder.getId(),
          },
        },
      },
      { signal: new AbortController().signal }
    );

    // Normalize IDs in the response
    const normalizedResult = {
      ...result,
      content: result.content.map((content) => {
        const parsed = JSON.parse(content.text as string);
        return {
          ...content,
          text: JSON.stringify(DataTypeTestHelper.normaliseIds(parsed)),
        };
      }),
    };

    // Verify the handler response using snapshot
    expect(normalizedResult).toMatchSnapshot();

    // Verify the data type was actually copied to the folder
    const copiedDataType = await DataTypeTestHelper.findDataType(
      TEST_DATATYPE_COPY_NAME
    );
    expect(copiedDataType).toBeTruthy();
    expect(copiedDataType?.parent?.id).toBe(folderBuilder.getId());
  });

  it("should copy a data type to root", async () => {
    // Create a data type to copy
    const dataTypeBuilder = await new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .create();

    // Copy the data type to root (no target)
    const result = await CopyDataTypeTool.handler(
      {
        id: dataTypeBuilder.getId(),
        body: {
          target: null,
        },
      },
      { signal: new AbortController().signal }
    );

    // Normalize IDs in the response
    const normalizedResult = {
      ...result,
      content: result.content.map((content) => {
        const parsed = JSON.parse(content.text as string);
        return {
          ...content,
          text: JSON.stringify(DataTypeTestHelper.normaliseIds(parsed)),
        };
      }),
    };

    // Verify the handler response using snapshot
    expect(normalizedResult).toMatchSnapshot();

    // Verify the data type was actually copied to root
    const copiedDataType = await DataTypeTestHelper.findDataType(
      TEST_DATATYPE_COPY_NAME
    );
    expect(copiedDataType).toBeTruthy();
    expect(copiedDataType?.parent).toBeNull();
  });

  it("should handle non-existent data type", async () => {
    const result = await CopyDataTypeTool.handler(
      {
        id: BLANK_UUID,
        body: {
          target: null,
        },
      },
      { signal: new AbortController().signal }
    );

    // Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });
});