import UpdatePartialViewTool from "../put/update-partial-view.js";
import { PartialViewBuilder } from "./helpers/partial-view-builder.js";
import { PartialViewHelper } from "./helpers/partial-view-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_PARTIAL_VIEW_NAME = "_TestUpdatePartialView.cshtml";
const TEST_INITIAL_CONTENT = "@* Initial content *@\n<div><p>Initial Content</p></div>";
const TEST_UPDATED_CONTENT = "@* Updated content *@\n<div><p>Updated Content</p></div>";
const NON_EXISTENT_PATH = "/_NonExistentPartialView.cshtml";

describe("update-partial-view", () => {
  setupTestEnvironment();

  let builder: PartialViewBuilder;

  beforeEach(() => {
    builder = new PartialViewBuilder();
  });

  afterEach(async () => {
    await PartialViewHelper.cleanup(TEST_PARTIAL_VIEW_NAME);
  });

  it("should update a partial view", async () => {
    // Arrange - Create initial partial view
    await builder
      .withName(TEST_PARTIAL_VIEW_NAME)
      .withContent(TEST_INITIAL_CONTENT)
      .create();

    const params = {
      path: builder.getPath(),
      data: {
        content: TEST_UPDATED_CONTENT
      }
    };

    // Act
    const result = await UpdatePartialViewTool.handler(params, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify the updated partial view exists and has updated content
    const updatedPartialView = await PartialViewHelper.getPartialView(builder.getPath());
    expect(updatedPartialView.content).toBe(TEST_UPDATED_CONTENT);
  });

  it("should handle non-existent partial view", async () => {
    // Arrange
    const params = {
      path: NON_EXISTENT_PATH,
      data: {
        content: TEST_UPDATED_CONTENT
      }
    };

    // Act
    const result = await UpdatePartialViewTool.handler(params, createMockRequestHandlerExtra());

    // Assert - Error responses don't use createSnapshotResult
    expect(result).toMatchSnapshot();
  });

  it("should update partial view with empty content", async () => {
    // Arrange - Create initial partial view
    await builder
      .withName(TEST_PARTIAL_VIEW_NAME)
      .withContent(TEST_INITIAL_CONTENT)
      .create();

    const params = {
      path: builder.getPath(),
      data: {
        content: ""
      }
    };

    // Act
    const result = await UpdatePartialViewTool.handler(params, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify the updated partial view has empty content
    const updatedPartialView = await PartialViewHelper.getPartialView(builder.getPath());
    expect(updatedPartialView.content).toBe("");
  });
});
