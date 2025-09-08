import UpdateStylesheetTool from "../put/update-stylesheet.js";
import { StylesheetHelper } from "./helpers/stylesheet-helper.js";
import { StylesheetBuilder } from "./helpers/stylesheet-builder.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const TEST_STYLESHEET_NAME = "_TestUpdateStylesheet.css";
const ORIGINAL_CONTENT = "/* Original content */\nbody { color: black; }";
const UPDATED_CONTENT = "/* Updated content */\nbody { color: blue; }\n.new-class { margin: 5px; }";
const NON_EXISTENT_STYLESHEET_PATH = "/_NonExistentStylesheet.css";

describe("update-stylesheet", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await StylesheetHelper.cleanup(TEST_STYLESHEET_NAME);
    console.error = originalConsoleError;
  });

  it("should update a stylesheet", async () => {
    // Arrange - Create a stylesheet first using builder
    const stylesheetBuilder = new StylesheetBuilder()
      .withName(TEST_STYLESHEET_NAME)
      .withContent(ORIGINAL_CONTENT);
    
    await stylesheetBuilder.create();
    const stylesheetPath = stylesheetBuilder.getPath();

    // Act
    const result = await UpdateStylesheetTool().handler({ 
      path: stylesheetPath, 
      content: UPDATED_CONTENT 
    }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify the content was updated by getting the stylesheet
    const updatedStylesheet = await StylesheetHelper.getStylesheet(stylesheetPath);
    expect(updatedStylesheet?.content).toBe(UPDATED_CONTENT);
    expect(updatedStylesheet?.content).toContain("color: blue;");
    expect(updatedStylesheet?.content).toContain(".new-class");
  });

  it("should handle non-existent stylesheet", async () => {
    // Act
    const result = await UpdateStylesheetTool().handler({ 
      path: NON_EXISTENT_STYLESHEET_PATH, 
      content: UPDATED_CONTENT 
    }, { signal: new AbortController().signal });

    // Assert
    expect(result).toMatchSnapshot();
  });
});