import GetLogViewerSavedSearchByNameTool from "../get/get-log-viewer-saved-search-by-name.js";
import { LogViewerSavedSearchBuilder } from "./helpers/log-viewer-saved-search-builder.js";
import { LogViewerTestHelper } from "./helpers/log-viewer-test-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_SEARCH_NAME = "_Test Saved Search";

describe("get-log-viewer-saved-search-by-name", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any test saved searches
    await LogViewerTestHelper.cleanup(TEST_SEARCH_NAME);
  });

  it("should get a saved search by name", async () => {
    // Create test saved search
    await new LogViewerSavedSearchBuilder()
      .withName(TEST_SEARCH_NAME)
      .withQuery("level:Error")
      .create();

    const result = await GetLogViewerSavedSearchByNameTool.handler(
      { name: TEST_SEARCH_NAME },
      createMockRequestHandlerExtra()
    );

    // Verify the response using snapshot
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should handle non-existent saved search", async () => {
    const result = await GetLogViewerSavedSearchByNameTool.handler(
      { name: "NonExistentSearch" },
      createMockRequestHandlerExtra()
    );

    // Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });

  it("should handle empty name parameter", async () => {
    const result = await GetLogViewerSavedSearchByNameTool.handler(
      { name: "" },
      createMockRequestHandlerExtra()
    );

    // Verify the response using snapshot
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
