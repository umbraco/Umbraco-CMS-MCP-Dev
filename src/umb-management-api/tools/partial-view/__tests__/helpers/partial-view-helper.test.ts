import { PartialViewHelper } from "./partial-view-helper.js";
import { PartialViewBuilder } from "./partial-view-builder.js";
import { PartialViewFolderBuilder } from "./partial-view-folder-builder.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { jest } from "@jest/globals";

const TEST_PARTIAL_VIEW_NAME = "_TestHelperPartialView";
const TEST_FOLDER_NAME = "_TestHelperFolder";
const TEST_CONTENT = "@* Test helper content *@\n<p>Helper Test</p>";

describe("PartialViewHelper", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await PartialViewHelper.cleanup(TEST_PARTIAL_VIEW_NAME + ".cshtml");
    await PartialViewHelper.cleanup(TEST_FOLDER_NAME);
  });

  it("should verify partial view exists after creation", async () => {
    // Arrange
    const builder = new PartialViewBuilder()
      .withName(TEST_PARTIAL_VIEW_NAME)
      .withContent(TEST_CONTENT);
    
    await builder.create();

    // Act
    const exists = await PartialViewHelper.verifyPartialView(builder.getPath());

    // Assert
    expect(exists).toBe(true);
  });

  it("should verify partial view folder exists after creation", async () => {
    // Arrange
    const folderBuilder = new PartialViewFolderBuilder()
      .withName(TEST_FOLDER_NAME);
    
    await folderBuilder.create();

    // Act
    const exists = await PartialViewHelper.verifyPartialViewFolder(folderBuilder.getPath());

    // Assert
    expect(exists).toBe(true);
  });

  it("should find partial view by name", async () => {
    // Arrange
    const builder = new PartialViewBuilder()
      .withName(TEST_PARTIAL_VIEW_NAME)
      .withContent(TEST_CONTENT);
    
    await builder.create();

    // Act
    const found = await PartialViewHelper.findPartialView(TEST_PARTIAL_VIEW_NAME + ".cshtml");

    // Assert
    expect(found).toBeDefined();
    expect(found.name).toBe(TEST_PARTIAL_VIEW_NAME + ".cshtml");
  });

  it("should find partial views with snapshot normalization", async () => {
    // Arrange
    const builder = new PartialViewBuilder()
      .withName(TEST_PARTIAL_VIEW_NAME)
      .withContent(TEST_CONTENT);
    
    await builder.create();

    // Act
    const foundItems = await PartialViewHelper.findPartialViews(TEST_PARTIAL_VIEW_NAME + ".cshtml");

    // Assert
    expect(foundItems).toMatchSnapshot();
  });

  it("should find partial view folders", async () => {
    // Arrange
    const folderBuilder = new PartialViewFolderBuilder()
      .withName(TEST_FOLDER_NAME);
    
    await folderBuilder.create();

    // Act
    const foundFolders = await PartialViewHelper.findPartialViewFolders(TEST_FOLDER_NAME);

    // Assert
    expect(foundFolders).toHaveLength(1);
    expect(foundFolders[0].name).toBe(TEST_FOLDER_NAME);
    expect(foundFolders[0].isFolder).toBe(true);
  });

  it("should get partial view with snapshot normalization", async () => {
    // Arrange
    const builder = new PartialViewBuilder()
      .withName(TEST_PARTIAL_VIEW_NAME)
      .withContent(TEST_CONTENT);
    
    await builder.create();

    // Act
    const partialView = await PartialViewHelper.getPartialView(builder.getPath());

    // Assert
    expect(partialView).toMatchSnapshot();
  });

  it("should get partial view folder with snapshot normalization", async () => {
    // Arrange
    const folderBuilder = new PartialViewFolderBuilder()
      .withName(TEST_FOLDER_NAME);
    
    await folderBuilder.create();

    // Act
    const folder = await PartialViewHelper.getPartialViewFolder(folderBuilder.getPath());

    // Assert
    expect(folder).toMatchSnapshot();
  });

  it("should cleanup created items", async () => {
    // Arrange
    const builder = new PartialViewBuilder()
      .withName(TEST_PARTIAL_VIEW_NAME)
      .withContent(TEST_CONTENT);
    
    await builder.create();
    const path = builder.getPath();

    // Verify it exists
    let exists = await PartialViewHelper.verifyPartialView(path);
    expect(exists).toBe(true);

    // Act
    await PartialViewHelper.cleanup(TEST_PARTIAL_VIEW_NAME + ".cshtml");

    // Assert
    exists = await PartialViewHelper.verifyPartialView(path);
    expect(exists).toBe(false);
  });
});