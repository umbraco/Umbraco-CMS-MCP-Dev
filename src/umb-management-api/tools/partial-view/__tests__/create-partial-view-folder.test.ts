import CreatePartialViewFolderTool from "../post/create-partial-view-folder.js";
import { PartialViewHelper } from "./helpers/partial-view-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { jest } from "@jest/globals";

const TEST_FOLDER_NAME = "_TestCreateFolder";
const EXISTING_FOLDER_NAME = "_ExistingFolder";

describe("create-partial-view-folder", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await PartialViewHelper.cleanup(TEST_FOLDER_NAME);
    await PartialViewHelper.cleanup(EXISTING_FOLDER_NAME);
    console.error = originalConsoleError;
  });

  it("should create a partial view folder", async () => {
    // Arrange
    const params = {
      name: TEST_FOLDER_NAME
    };

    // Act
    const result = await CreatePartialViewFolderTool.handler(params, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify the created folder exists
    const searchResult = await PartialViewHelper.findPartialViews(TEST_FOLDER_NAME);
    const normalizedSearchResult = searchResult.map(item => ({
      ...item,
      id: item.id ? BLANK_UUID : item.id,
      parent: item.parent?.id ? { ...item.parent, id: BLANK_UUID } : item.parent
    }));
    expect(normalizedSearchResult).toMatchSnapshot();
  });

  it("should handle existing folder name", async () => {
    // Arrange - First create the folder
    await CreatePartialViewFolderTool.handler({
      name: EXISTING_FOLDER_NAME
    }, { signal: new AbortController().signal });

    // Act - Try to create it again
    const result = await CreatePartialViewFolderTool.handler({
      name: EXISTING_FOLDER_NAME
    }, { signal: new AbortController().signal });

    // Assert
    expect(result).toMatchSnapshot();
  });

});