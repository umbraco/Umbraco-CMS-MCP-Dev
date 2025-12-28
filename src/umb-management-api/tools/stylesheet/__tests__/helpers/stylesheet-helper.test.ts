import { StylesheetHelper } from "./stylesheet-helper.js";
import { StylesheetBuilder } from "./stylesheet-builder.js";
import { StylesheetFolderBuilder } from "./stylesheet-folder-builder.js";
import { jest } from "@jest/globals";

const TEST_STYLESHEET_NAME = "_TestHelperStylesheet";
const TEST_FOLDER_NAME = "_TestHelperFolder";
const TEST_CONTENT = "/* Test helper content */\nbody {\n  color: #333;\n}";

describe("StylesheetHelper", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await StylesheetHelper.cleanup(TEST_STYLESHEET_NAME + ".css");
    await StylesheetHelper.cleanup(TEST_FOLDER_NAME);
  });

  it("should verify stylesheet exists after creation", async () => {
    // Arrange
    const builder = new StylesheetBuilder()
      .withName(TEST_STYLESHEET_NAME)
      .withContent(TEST_CONTENT);
    
    await builder.create();

    // Act
    const exists = await StylesheetHelper.verifyStylesheet(builder.getPath());

    // Assert
    expect(exists).toBe(true);
  });

  it("should verify stylesheet folder exists after creation", async () => {
    // Arrange
    const folderBuilder = new StylesheetFolderBuilder()
      .withName(TEST_FOLDER_NAME);
    
    await folderBuilder.create();

    // Act
    const exists = await StylesheetHelper.verifyStylesheetFolder(folderBuilder.getPath());

    // Assert
    expect(exists).toBe(true);
  });

  it("should find stylesheet by name", async () => {
    // Arrange
    const builder = new StylesheetBuilder()
      .withName(TEST_STYLESHEET_NAME)
      .withContent(TEST_CONTENT);
    
    await builder.create();

    // Act
    const found = await StylesheetHelper.findStylesheet(TEST_STYLESHEET_NAME + ".css");

    // Assert
    expect(found).toBeDefined();
    expect(found.name).toBe(TEST_STYLESHEET_NAME + ".css");
  });

  it("should find stylesheet items with snapshot normalization", async () => {
    // Arrange
    const builder = new StylesheetBuilder()
      .withName(TEST_STYLESHEET_NAME)
      .withContent(TEST_CONTENT);
    
    await builder.create();

    // Act
    const foundItems = await StylesheetHelper.findStylesheetItems(TEST_STYLESHEET_NAME + ".css");

    // Assert
    expect(foundItems).toMatchSnapshot();
  });

  it("should find stylesheet folders", async () => {
    // Arrange
    const folderBuilder = new StylesheetFolderBuilder()
      .withName(TEST_FOLDER_NAME);
    
    await folderBuilder.create();

    // Act
    const foundFolders = await StylesheetHelper.findStylesheetFolders(TEST_FOLDER_NAME);

    // Assert
    expect(foundFolders).toHaveLength(1);
    expect(foundFolders[0].name).toBe(TEST_FOLDER_NAME);
    expect(foundFolders[0].isFolder).toBe(true);
  });

  it("should get stylesheet with snapshot normalization", async () => {
    // Arrange
    const builder = new StylesheetBuilder()
      .withName(TEST_STYLESHEET_NAME)
      .withContent(TEST_CONTENT);
    
    await builder.create();

    // Act
    const stylesheet = await StylesheetHelper.getStylesheet(builder.getPath());

    // Assert
    expect(stylesheet).toMatchSnapshot();
  });

  it("should get stylesheet folder with snapshot normalization", async () => {
    // Arrange
    const folderBuilder = new StylesheetFolderBuilder()
      .withName(TEST_FOLDER_NAME);
    
    await folderBuilder.create();

    // Act
    const folder = await StylesheetHelper.getStylesheetFolder(folderBuilder.getPath());

    // Assert
    expect(folder).toMatchSnapshot();
  });

  it("should cleanup created items", async () => {
    // Arrange
    const builder = new StylesheetBuilder()
      .withName(TEST_STYLESHEET_NAME)
      .withContent(TEST_CONTENT);
    
    await builder.create();
    const path = builder.getPath();

    // Verify it exists
    let exists = await StylesheetHelper.verifyStylesheet(path);
    expect(exists).toBe(true);

    // Act
    await StylesheetHelper.cleanup(TEST_STYLESHEET_NAME + ".css");

    // Assert
    exists = await StylesheetHelper.verifyStylesheet(path);
    expect(exists).toBe(false);
  });
});