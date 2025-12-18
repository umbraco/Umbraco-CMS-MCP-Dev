import { StylesheetHelper } from "./helpers/stylesheet-helper.js";
import GetStylesheetSiblingsTool from "../items/get/get-siblings.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import { StylesheetFolderBuilder } from "./helpers/stylesheet-folder-builder.js";
import { StylesheetBuilder } from "./helpers/stylesheet-builder.js";

describe("get-stylesheet-siblings", () => {
  const TEST_FOLDER_NAME = "_TestFolderForSiblings";
  const TEST_SIBLING_1_NAME = "_TestSibling1.css";
  const TEST_SIBLING_2_NAME = "_TestSibling2.css";
  const TEST_TARGET_NAME = "_TestTargetStylesheet.css";
  const TEST_CONTENT = "/* Test stylesheet content */\nbody { color: red; }";
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await StylesheetHelper.cleanup(TEST_SIBLING_1_NAME);
    await StylesheetHelper.cleanup(TEST_SIBLING_2_NAME);
    await StylesheetHelper.cleanup(TEST_TARGET_NAME);
    await StylesheetHelper.cleanup(TEST_FOLDER_NAME);
    console.error = originalConsoleError;
  });

  it("should get sibling stylesheets", async () => {
    // Arrange: Create a parent folder with multiple children
    const folderBuilder = await new StylesheetFolderBuilder()
      .withName(TEST_FOLDER_NAME)
      .create();

    // Create first sibling
    await new StylesheetBuilder()
      .withName(TEST_SIBLING_1_NAME)
      .withContent(TEST_CONTENT)
      .withPath(folderBuilder.getPath())
      .create();

    // Create target stylesheet
    const targetBuilder = await new StylesheetBuilder()
      .withName(TEST_TARGET_NAME)
      .withContent(TEST_CONTENT)
      .withPath(folderBuilder.getPath())
      .create();

    // Create second sibling
    await new StylesheetBuilder()
      .withName(TEST_SIBLING_2_NAME)
      .withContent(TEST_CONTENT)
      .withPath(folderBuilder.getPath())
      .create();

    // Act: Get siblings for the target stylesheet
    const result = await GetStylesheetSiblingsTool.handler(
      {
        path: targetBuilder.getPath(),
      },
      { signal: new AbortController().signal }
    );

    // Assert: Verify response
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent stylesheet", async () => {
    // Arrange: Use a non-existent path
    const nonExistentPath = "non-existent-path.css";

    // Act: Try to get siblings for non-existent stylesheet
    const result = await GetStylesheetSiblingsTool.handler(
      {
        path: nonExistentPath,
      },
      { signal: new AbortController().signal }
    );

    // Assert: Verify error response
    expect(result).toMatchSnapshot();
  });
});
