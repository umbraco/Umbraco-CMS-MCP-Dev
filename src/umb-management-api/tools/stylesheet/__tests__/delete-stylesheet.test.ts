import DeleteStylesheetTool from "../delete/delete-stylesheet.js";
import { StylesheetHelper } from "./helpers/stylesheet-helper.js";
import { StylesheetBuilder } from "./helpers/stylesheet-builder.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_STYLESHEET_NAME = "_TestDeleteStylesheet.css";
const TEST_CONTENT = "/* Test delete stylesheet */\nbody { color: red; }";
const NON_EXISTENT_STYLESHEET_PATH = "/_NonExistentStylesheet.css";

describe("delete-stylesheet", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await StylesheetHelper.cleanup(TEST_STYLESHEET_NAME);
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
    const result = await DeleteStylesheetTool.handler({ path: stylesheetPath }, createMockRequestHandlerExtra());

    // Assert
    expect(result).toMatchSnapshot();

    // Verify the stylesheet no longer exists
    const existsAfter = await StylesheetHelper.verifyStylesheet(stylesheetPath);
    expect(existsAfter).toBe(false);
  });

  it("should handle non-existent stylesheet", async () => {
    // Act
    const result = await DeleteStylesheetTool.handler({ path: NON_EXISTENT_STYLESHEET_PATH }, createMockRequestHandlerExtra());

    // Assert
    expect(result).toMatchSnapshot();
  });
});