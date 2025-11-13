import CreateStylesheetTool from "../post/create-stylesheet.js";
import { StylesheetHelper } from "./helpers/stylesheet-helper.js";
import { StylesheetFolderBuilder } from "./helpers/stylesheet-folder-builder.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const TEST_STYLESHEET_NAME = "_TestCreateStylesheet.css";
const TEST_CONTENT = "/* Test create stylesheet */\nbody { color: blue; }\n.test { margin: 10px; }";
const EXISTING_STYLESHEET_NAME = "_ExistingStylesheet.css";
const EXISTING_CONTENT = "/* Existing content */\np { font-size: 14px; }";
const TEST_STYLESHEET_PARENT_FOLDER = "_TestStylesheetParentFolder";

describe("create-stylesheet", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await StylesheetHelper.cleanup(TEST_STYLESHEET_PARENT_FOLDER);
    await StylesheetHelper.cleanup(TEST_STYLESHEET_NAME);
    await StylesheetHelper.cleanup(EXISTING_STYLESHEET_NAME);
    console.error = originalConsoleError;
  });

  it("should create a stylesheet", async () => {
    // Arrange
    const params = {
      name: TEST_STYLESHEET_NAME,
      content: TEST_CONTENT
    };

    // Act
    const result = await CreateStylesheetTool().handler(params, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify the created stylesheet exists by path
    const exists = await StylesheetHelper.verifyStylesheet(`/${TEST_STYLESHEET_NAME}`);
    expect(exists).toBe(true);
  });

  it("should handle existing stylesheet name", async () => {
    // Arrange - First create the stylesheet
    await CreateStylesheetTool().handler({
      name: EXISTING_STYLESHEET_NAME,
      content: EXISTING_CONTENT
    }, { signal: new AbortController().signal });

    // Act - Try to create it again with same name
    const result = await CreateStylesheetTool().handler({
      name: EXISTING_STYLESHEET_NAME,
      content: TEST_CONTENT
    }, { signal: new AbortController().signal });

    // Assert
    expect(result).toMatchSnapshot();
  });

  it("should create stylesheet with parent folder", async () => {
    // Arrange - Create parent folder first using builder
    const folderBuilder = new StylesheetFolderBuilder()
      .withName(TEST_STYLESHEET_PARENT_FOLDER);

    await folderBuilder.create();

    const params = {
      name: TEST_STYLESHEET_NAME,
      content: TEST_CONTENT,
      path: folderBuilder.getPath()  // Flattened path parameter
    };

    // Act
    const result = await CreateStylesheetTool().handler(params, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify that the helper can now find stylesheets in folders
    const foundItem = await StylesheetHelper.findStylesheet(TEST_STYLESHEET_NAME);
    expect(foundItem).toBeDefined();
    expect(foundItem.path).toBe(`${folderBuilder.getPath()}/${TEST_STYLESHEET_NAME}`);
  });
});