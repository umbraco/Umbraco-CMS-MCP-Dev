import CreatePartialViewTool from "../post/create-partial-view.js";
import { PartialViewHelper } from "./helpers/partial-view-helper.js";
import { PartialViewFolderBuilder } from "./helpers/partial-view-folder-builder.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_PARTIAL_VIEW_NAME = "_TestCreatePartialView.cshtml";
const TEST_CONTENT = "@* Test create partial view *@\n<div><p>Create Test Content</p></div>";
const EXISTING_PARTIAL_VIEW_NAME = "_ExistingPartialView.cshtml";
const EXISTING_CONTENT = "@* Existing content *@\n<p>Already exists</p>";
const TEST_PARTIAL_VIEW_PARENT_FOLDER = "_TestPartialViewParentFolder";

describe("create-partial-view", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await PartialViewHelper.cleanup(TEST_PARTIAL_VIEW_PARENT_FOLDER);
    await PartialViewHelper.cleanup(TEST_PARTIAL_VIEW_NAME);
    await PartialViewHelper.cleanup(EXISTING_PARTIAL_VIEW_NAME);
  });

  it("should create a partial view", async () => {
    // Arrange
    const params = {
      name: TEST_PARTIAL_VIEW_NAME,
      content: TEST_CONTENT
    };

    // Act
    const result = await CreatePartialViewTool.handler(params as any, createMockRequestHandlerExtra());

    // Assert
    const data = validateToolResponse(CreatePartialViewTool, result);
    expect(data).toHaveProperty("message");
    expect(data).toHaveProperty("path");

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify the created partial view exists by path
    const exists = await PartialViewHelper.verifyPartialView(`/${TEST_PARTIAL_VIEW_NAME}`);
    expect(exists).toBe(true);
  });

  it("should handle existing partial view name", async () => {
    // Arrange - First create the partial view
    await CreatePartialViewTool.handler({
      name: EXISTING_PARTIAL_VIEW_NAME,
      content: EXISTING_CONTENT
    } as any, createMockRequestHandlerExtra());

    // Act - Try to create it again with same name
    const result = await CreatePartialViewTool.handler({
      name: EXISTING_PARTIAL_VIEW_NAME,
      content: TEST_CONTENT
    } as any, createMockRequestHandlerExtra());

    // Assert
    expect(result).toMatchSnapshot();
  });

  it("should create partial view with parent folder", async () => {
    // Arrange - Create parent folder first using builder
    const folderBuilder = new PartialViewFolderBuilder()
      .withName(TEST_PARTIAL_VIEW_PARENT_FOLDER);

    await folderBuilder.create();

    const params = {
      name: TEST_PARTIAL_VIEW_NAME,
      content: TEST_CONTENT,
      path: folderBuilder.getPath()
    };

    // Act
    const result = await CreatePartialViewTool.handler(params as any, createMockRequestHandlerExtra());

    // Assert
    const data = validateToolResponse(CreatePartialViewTool, result);
    expect(data).toHaveProperty("message");
    expect(data).toHaveProperty("path");

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify that the helper can now find partial views in folders
    const foundItems = await PartialViewHelper.findPartialViews(TEST_PARTIAL_VIEW_NAME);
    expect(foundItems.length).toBe(1);
    expect(foundItems[0].path).toBe(`${folderBuilder.getPath()}/${TEST_PARTIAL_VIEW_NAME}`);
  });
});
