import GetLogViewerSavedSearchTool from "../get/get-log-viewer-saved-search.js";
import { LogViewerSavedSearchBuilder } from "./helpers/log-viewer-saved-search-builder.js";
import { LogViewerTestHelper } from "./helpers/log-viewer-test-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_SEARCH_NAME = "_Test Saved Search";
const TEST_SEARCH_NAME_2 = "_Test Saved Search 2";

describe("get-log-viewer-saved-search", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any test saved searches
    await LogViewerTestHelper.cleanup(TEST_SEARCH_NAME);
    await LogViewerTestHelper.cleanup(TEST_SEARCH_NAME_2);
  });

  it("should get saved searches with default parameters", async () => {
    // Create test saved searches
    await new LogViewerSavedSearchBuilder()
      .withName(TEST_SEARCH_NAME)
      .withQuery("level:Error")
      .create();

    await new LogViewerSavedSearchBuilder()
      .withName(TEST_SEARCH_NAME_2)
      .withQuery("level:Warning")
      .create();

    const result = await GetLogViewerSavedSearchTool.handler(
      { skip: undefined, take: 100 },
      createMockRequestHandlerExtra()
    );

    // Verify the response using snapshot
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should get saved searches with custom parameters", async () => {
    // Create test saved searches
    await new LogViewerSavedSearchBuilder()
      .withName(TEST_SEARCH_NAME)
      .withQuery("level:Error")
      .create();

    await new LogViewerSavedSearchBuilder()
      .withName(TEST_SEARCH_NAME_2)
      .withQuery("level:Warning")
      .create();

    const result = await GetLogViewerSavedSearchTool.handler(
      { skip: 0, take: 10 },
      createMockRequestHandlerExtra()
    );

    // Verify the response using snapshot
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should handle empty result set", async () => {
    const result = await GetLogViewerSavedSearchTool.handler(
      { skip: undefined, take: 100 },
      createMockRequestHandlerExtra()
    );

    // Verify the response using snapshot
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
