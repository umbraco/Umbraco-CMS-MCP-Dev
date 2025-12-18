import GetStylesheetByPathTool from "../get/get-stylesheet-by-path.js";
import { StylesheetHelper } from "./helpers/stylesheet-helper.js";
import { StylesheetBuilder } from "./helpers/stylesheet-builder.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const TEST_STYLESHEET_NAME = "_TestGetStylesheet.css";
const TEST_CONTENT = "/* Test get stylesheet */\nbody { background: white; }\n.container { padding: 20px; }";
const NON_EXISTENT_STYLESHEET_PATH = "/_NonExistentStylesheet.css";

describe("get-stylesheet-by-path", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await StylesheetHelper.cleanup(TEST_STYLESHEET_NAME);
    console.error = originalConsoleError;
  });

  it("should get a stylesheet by path", async () => {
    // Arrange - Create a stylesheet first using builder
    const stylesheetBuilder = new StylesheetBuilder()
      .withName(TEST_STYLESHEET_NAME)
      .withContent(TEST_CONTENT);
    
    await stylesheetBuilder.create();
    const stylesheetPath = stylesheetBuilder.getPath();

    // Act
    const result = await GetStylesheetByPathTool.handler({ path: stylesheetPath }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify content is preserved with CSS formatting
    const parsedResult = JSON.parse(result.content[0].text as string);
    expect(parsedResult.content).toContain("background: white;");
    expect(parsedResult.content).toContain("padding: 20px;");
    expect(parsedResult.name).toBe(TEST_STYLESHEET_NAME);
    expect(parsedResult.path).toBe(stylesheetPath);
  });

  it("should handle non-existent stylesheet", async () => {
    // Act
    const result = await GetStylesheetByPathTool.handler({ path: NON_EXISTENT_STYLESHEET_PATH }, { signal: new AbortController().signal });

    // Assert
    expect(result).toMatchSnapshot();
  });
});