import DeletePartialViewTool from "../delete/delete-partial-view.js";
import { PartialViewBuilder } from "./helpers/partial-view-builder.js";
import { PartialViewHelper } from "./helpers/partial-view-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const TEST_PARTIAL_VIEW_NAME = "_TestDeletePartialView.cshtml";
const TEST_CONTENT = "@* Test delete content *@\n<div><p>Delete Test Content</p></div>";
const NON_EXISTENT_PATH = "/_NonExistentPartialView.cshtml";

describe("delete-partial-view", () => {
  let originalConsoleError: typeof console.error;
  let builder: PartialViewBuilder;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    builder = new PartialViewBuilder();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
  });

  it("should delete a partial view", async () => {
    // Arrange - Create partial view to delete
    await builder
      .withName(TEST_PARTIAL_VIEW_NAME)
      .withContent(TEST_CONTENT)
      .create();

    // Verify it exists before deletion
    const existsBeforeDelete = await PartialViewHelper.verifyPartialView(builder.getPath());
    expect(existsBeforeDelete).toBe(true);

    const params = {
      path: builder.getPath()
    };

    // Act
    const result = await DeletePartialViewTool.handler(params, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify the partial view no longer exists
    const existsAfterDelete = await PartialViewHelper.verifyPartialView(builder.getPath());
    expect(existsAfterDelete).toBe(false);
  });

  it("should handle non-existent partial view", async () => {
    // Arrange
    const params = {
      path: NON_EXISTENT_PATH
    };

    // Act
    const result = await DeletePartialViewTool.handler(params, { signal: new AbortController().signal });

    // Assert - Error responses don't use createSnapshotResult
    expect(result).toMatchSnapshot();
  });

});