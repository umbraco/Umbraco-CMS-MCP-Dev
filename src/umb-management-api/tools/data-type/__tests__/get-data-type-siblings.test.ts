import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import GetDataTypeSiblingsTool from "../items/get/get-siblings.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import { DataTypeFolderBuilder } from "./helpers/data-type-folder-builder.js";
import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra, validateErrorResult } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_FOLDER_NAME = "_Test Folder DataType";
const TEST_SIBLING_1_NAME = "_Test Sibling 1 DataType";
const TEST_SIBLING_2_NAME = "_Test Sibling 2 DataType";
const TEST_SIBLING_3_NAME = "_Test Sibling 3 DataType";

describe("get-data-type-siblings", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await DataTypeTestHelper.cleanup(TEST_SIBLING_1_NAME);
    await DataTypeTestHelper.cleanup(TEST_SIBLING_2_NAME);
    await DataTypeTestHelper.cleanup(TEST_SIBLING_3_NAME);
    await DataTypeTestHelper.cleanup(TEST_FOLDER_NAME);
    console.error = originalConsoleError;
  });

  it("should get sibling data types", async () => {
    // Arrange - Create parent folder with multiple sibling data types
    const folderBuilder = await new DataTypeFolderBuilder(
      TEST_FOLDER_NAME
    ).create();

    const sibling1Builder = await new DataTypeBuilder()
      .withName(TEST_SIBLING_1_NAME)
      .withTextbox()
      .withParentId(folderBuilder.getId())
      .create();

    await new DataTypeBuilder()
      .withName(TEST_SIBLING_2_NAME)
      .withTextbox()
      .withParentId(folderBuilder.getId())
      .create();

    await new DataTypeBuilder()
      .withName(TEST_SIBLING_3_NAME)
      .withTextbox()
      .withParentId(folderBuilder.getId())
      .create();

    // Act - Get siblings using one of the items as target
    const result = await GetDataTypeSiblingsTool.handler(
      { target: sibling1Builder.getId() } as any,
      createMockRequestHandlerExtra()
    );

    // Assert - Verify the siblings are returned
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should handle non-existent target", async () => {
    // Act - Try to get siblings for non-existent item
    const result = await GetDataTypeSiblingsTool.handler(
      { target: BLANK_UUID } as any,
      createMockRequestHandlerExtra()
    );

    // Assert - Verify the error response
    validateErrorResult(result);
    expect(result).toMatchSnapshot();
  });
});
