import CreateDataTypeTool from "../post/create-data-type.js";
import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { DataTypeFolderBuilder } from "./helpers/data-type-folder-builder.js";
import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import { jest } from "@jest/globals";

const TEST_DATATYPE_NAME = "_Test DataType Created";
const EXISTING_DATATYPE_NAME = "_Existing DataType";
const TEST_FOLDER_NAME = "_Test DataType Folder";
const TEST_DATATYPE_WITH_PARENT_NAME = "_Test DataType With Parent";

describe("create-data-type", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    // Clean up any test data types
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_NAME);
    await DataTypeTestHelper.cleanup(EXISTING_DATATYPE_NAME);
    await DataTypeTestHelper.cleanup(TEST_FOLDER_NAME);
    await DataTypeTestHelper.cleanup(TEST_DATATYPE_WITH_PARENT_NAME);
    console.error = originalConsoleError;

  });

  it("should create a data type", async () => {
    // Create data type model using builder
    const dataTypeModel = new DataTypeBuilder()
      .withName(TEST_DATATYPE_NAME)
      .withTextbox()
      .build();

    // Create the data type
    const result = await CreateDataTypeTool().handler(dataTypeModel, {
      signal: new AbortController().signal
    });

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();

    // Verify the created item exists and matches expected values
    const item = await DataTypeTestHelper.findDataType(TEST_DATATYPE_NAME);
    expect(item).toBeDefined();
    expect(DataTypeTestHelper.normaliseIds(item!)).toMatchSnapshot();
  });

  it("should create a data type with parent folder", async () => {
    // Arrange: Create parent folder
    const folderBuilder = await new DataTypeFolderBuilder(
      TEST_FOLDER_NAME
    ).create();

    // Arrange: Create data type with flattened parentId for tool
    const result = await CreateDataTypeTool().handler({
      name: TEST_DATATYPE_WITH_PARENT_NAME,
      editorAlias: "Umbraco.TextBox",
      editorUiAlias: "Umb.PropertyEditorUi.TextBox",
      values: [],
      parentId: folderBuilder.getId()  // Flattened parent ID
    }, {
      signal: new AbortController().signal,
    });

    // Assert: Verify the handler response
    expect(result).toMatchSnapshot();

    // Assert: Verify the created item exists with correct parent
    const item = await DataTypeTestHelper.findDataType(
      TEST_DATATYPE_WITH_PARENT_NAME
    );
    expect(item).toBeDefined();
    expect(item!.parent).toBeDefined();
    expect(item!.parent!.id).toBe(folderBuilder.getId());
    expect(DataTypeTestHelper.normaliseIds(item!)).toMatchSnapshot();
  });

}); 