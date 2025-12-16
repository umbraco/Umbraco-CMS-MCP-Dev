import DeleteStylesheetTool from "../delete/delete-stylesheet.js";
import { StylesheetHelper } from "./helpers/stylesheet-helper.js";
import { StylesheetBuilder } from "./helpers/stylesheet-builder.js";
import { jest } from "@jest/globals";

const TEST_STYLESHEET_NAME = "_TestDeleteStylesheet.css";
const TEST_CONTENT = "/* Test delete stylesheet */\nbody { color: red; }";
const NON_EXISTENT_STYLESHEET_PATH = "/_NonExistentStylesheet.css";

describe("delete-stylesheet", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await StylesheetHelper.cleanup(TEST_STYLESHEET_NAME);
    console.error = originalConsoleError;
  });

  it("should delete a stylesheet", async () => {
    // Arrange - Create a stylesheet first using builder
    const stylesheetBuilder = new StylesheetBuilder()
      .withName(TEST_STYLESHEET_NAME)
      .withContent(TEST_CONTENT);
    
    await stylesheetBuilder.create();
    const stylesheetPath = stylesheetBuilder.getPath();

    // Verify it exists before deletion
    const existsBefore = await StylesheetHelper.verifyStylesheet(stylesheetPath);
    expect(existsBefore).toBe(true);

    // Act
    const result = await DeleteStylesheetTool.handler({ path: stylesheetPath }, { signal: new AbortController().signal });

    // Assert
    expect(result).toMatchSnapshot();

    // Verify the stylesheet no longer exists
    const existsAfter = await StylesheetHelper.verifyStylesheet(stylesheetPath);
    expect(existsAfter).toBe(false);
  });

  it("should handle non-existent stylesheet", async () => {
    // Act
    const result = await DeleteStylesheetTool.handler({ path: NON_EXISTENT_STYLESHEET_PATH }, { signal: new AbortController().signal });

    // Assert
    expect(result).toMatchSnapshot();
  });
});