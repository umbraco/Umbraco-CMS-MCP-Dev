import DeleteLogViewerSavedSearchByNameTool from "../delete/delete-log-viewer-saved-search-by-name.js";
import { LogViewerSavedSearchBuilder } from "./helpers/log-viewer-saved-search-builder.js";
import { LogViewerTestHelper } from "./helpers/log-viewer-test-helper.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

const TEST_SEARCH_NAME = "_Test Saved Search";

describe("delete-log-viewer-saved-search-by-name", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any test saved searches
    await LogViewerTestHelper.cleanup(TEST_SEARCH_NAME);
  });

  it("should delete a saved search by name", async () => {
    // Create test saved search
    await new LogViewerSavedSearchBuilder()
      .withName(TEST_SEARCH_NAME)
      .withQuery("level:Error")
      .create();

    const result = await DeleteLogViewerSavedSearchByNameTool.handler(
      { name: TEST_SEARCH_NAME },
      createMockRequestHandlerExtra()
    );

    // Verify the response using snapshot
    expect(result).toMatchSnapshot();

    // Verify the saved search is deleted
    const item = await LogViewerTestHelper.findSavedSearch(TEST_SEARCH_NAME);
    expect(item).toBeUndefined();
  });

  it("should handle non-existent saved search", async () => {
    const result = await DeleteLogViewerSavedSearchByNameTool.handler(
      { name: "NonExistentSearch" },
      createMockRequestHandlerExtra()
    );

    // Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });

  it("should handle empty name parameter", async () => {
    const result = await DeleteLogViewerSavedSearchByNameTool.handler(
      { name: "" },
      createMockRequestHandlerExtra()
    );

    // Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });
});
