import RenameStylesheetTool from "../put/rename-stylesheet.js";
import { StylesheetHelper } from "./helpers/stylesheet-helper.js";
import { StylesheetBuilder } from "./helpers/stylesheet-builder.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const TEST_STYLESHEET_NAME = "_TestRenameStylesheet.css";
const NEW_STYLESHEET_NAME = "_RenamedStylesheet.css";
const TEST_CONTENT = "/* Test rename stylesheet */\nbody { font-family: Arial; }";
const NON_EXISTENT_STYLESHEET_PATH = "/_NonExistentStylesheet.css";

describe("rename-stylesheet", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await StylesheetHelper.cleanup(TEST_STYLESHEET_NAME);
    await StylesheetHelper.cleanup(NEW_STYLESHEET_NAME);
    console.error = originalConsoleError;
  });

  it("should rename a stylesheet", async () => {
    // Arrange - Create a stylesheet first using builder
    const stylesheetBuilder = new StylesheetBuilder()
      .withName(TEST_STYLESHEET_NAME)
      .withContent(TEST_CONTENT);
    
    await stylesheetBuilder.create();
    const originalPath = stylesheetBuilder.getPath();

    // Verify original exists
    const existsBefore = await StylesheetHelper.verifyStylesheet(originalPath);
    expect(existsBefore).toBe(true);

    // Act
    const result = await RenameStylesheetTool.handler({ 
      path: originalPath, 
      name: NEW_STYLESHEET_NAME 
    }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify the original no longer exists and renamed one exists
    const originalExists = await StylesheetHelper.verifyStylesheet(originalPath);
    expect(originalExists).toBe(false);
    
    const newPath = `/${NEW_STYLESHEET_NAME}`;
    const renamedExists = await StylesheetHelper.verifyStylesheet(newPath);
    expect(renamedExists).toBe(true);

    // Verify content is preserved after rename
    const renamedStylesheet = await StylesheetHelper.getStylesheet(newPath);
    expect(renamedStylesheet?.content).toBe(TEST_CONTENT);
  });

  it("should handle non-existent stylesheet", async () => {
    // Act
    const result = await RenameStylesheetTool.handler({ 
      path: NON_EXISTENT_STYLESHEET_PATH, 
      name: NEW_STYLESHEET_NAME 
    }, { signal: new AbortController().signal });

    // Assert
    expect(result).toMatchSnapshot();
  });
});