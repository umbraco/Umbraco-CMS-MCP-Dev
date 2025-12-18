import CreateMediaFolderTool from "../post/create-media-folder.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { jest } from "@jest/globals";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_FOLDER_NAME = "_Test Folder Created";
const TEST_NESTED_FOLDER_NAME = "_Test Nested Folder";
const TEST_PARENT_FOLDER_NAME = "_Test Parent Folder";

describe("create-media-folder", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    // Clean up any test folders
    await MediaTestHelper.cleanup(TEST_FOLDER_NAME);
    await MediaTestHelper.cleanup(TEST_NESTED_FOLDER_NAME);
    await MediaTestHelper.cleanup(TEST_PARENT_FOLDER_NAME);
    console.error = originalConsoleError;
  });

  it("should create a folder at root level", async () => {
    // Act
    const result = await CreateMediaFolderTool.handler(
      {
        name: TEST_FOLDER_NAME,
      },
      { signal: new AbortController().signal }
    );

    // Assert
    expect(result).toMatchSnapshot();

    // Verify the created folder exists
    const found = await MediaTestHelper.findMedia(TEST_FOLDER_NAME);
    expect(found).toBeDefined();
    expect(MediaTestHelper.getNameFromItem(found)).toBe(TEST_FOLDER_NAME);
  });

  it("should create a folder inside another folder", async () => {
    // Arrange - Create parent folder
    const parentBuilder = await new MediaBuilder()
      .withName(TEST_PARENT_FOLDER_NAME)
      .withFolderMediaType()
      .create();

    // Act - Create nested folder
    const result = await CreateMediaFolderTool.handler(
      {
        name: TEST_NESTED_FOLDER_NAME,
        parentId: parentBuilder.getId(),
      },
      { signal: new AbortController().signal }
    );

    // Assert
    expect(result).toMatchSnapshot();

    // Verify the nested folder exists and is a child of the parent
    const children = await parentBuilder.getChildren();
    const nestedFolder = children.items.find(
      (item) => MediaTestHelper.getNameFromItem(item) === TEST_NESTED_FOLDER_NAME
    );
    expect(nestedFolder).toBeDefined();
  });

  it("should handle non-existent parent ID", async () => {
    // Act - Try to create folder with non-existent parent
    const result = await CreateMediaFolderTool.handler(
      {
        name: TEST_FOLDER_NAME,
        parentId: BLANK_UUID,
      },
      { signal: new AbortController().signal }
    );

    // Assert - Verify the error response
    expect(result).toMatchSnapshot();
    expect(result.isError).toBe(true);
  });
});
