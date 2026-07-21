import GetStylesheetByPathTool from "../get/get-stylesheet-by-path.js";
import { StylesheetHelper } from "./helpers/stylesheet-helper.js";
import { StylesheetBuilder } from "./helpers/stylesheet-builder.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_STYLESHEET_NAME = "_TestGetStylesheet.css";
const TEST_CONTENT = "/* Test get stylesheet */\nbody { background: white; }\n.container { padding: 20px; }";
const NON_EXISTENT_STYLESHEET_PATH = "/_NonExistentStylesheet.css";

describe("get-stylesheet-by-path", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await StylesheetHelper.cleanup(TEST_STYLESHEET_NAME);
  });

  it("should get a stylesheet by path", async () => {
    // Arrange - Create a stylesheet first using builder
    const stylesheetBuilder = new StylesheetBuilder()
      .withName(TEST_STYLESHEET_NAME)
      .withContent(TEST_CONTENT);
    
    await stylesheetBuilder.create();
    const stylesheetPath = stylesheetBuilder.getPath();

    // Act
    const result = await GetStylesheetByPathTool.handler({ path: stylesheetPath }, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify content is preserved with CSS formatting
    const parsedResult = validateToolResponse(GetStylesheetByPathTool, result);
    expect(parsedResult.content).toContain("background: white;");
    expect(parsedResult.content).toContain("padding: 20px;");
    expect(parsedResult.name).toBe(TEST_STYLESHEET_NAME);
    expect(parsedResult.path).toBe(stylesheetPath);
  });

  it("should handle non-existent stylesheet", async () => {
    // Act
    const result = await GetStylesheetByPathTool.handler({ path: NON_EXISTENT_STYLESHEET_PATH }, createMockRequestHandlerExtra());

    // Assert
    expect(result).toMatchSnapshot();
  });
});