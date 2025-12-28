import GetSearcherBySearcherNameQueryTool from "../get/get-searcher-by-searcher-name-query.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { jest } from "@jest/globals";

const TEST_SEARCHER_NAME = "ExternalIndex";

describe("get-searcher-by-searcher-name-query", () => {
  let originalConsoleError: typeof console.error;
  let originalGetClient: typeof UmbracoManagementClient.getClient;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    originalGetClient = UmbracoManagementClient.getClient;
  });

  afterEach(() => {
    console.error = originalConsoleError;
    UmbracoManagementClient.getClient = originalGetClient;
  });

  it("should get searcher query results by searcher name", async () => {
    const result = await GetSearcherBySearcherNameQueryTool.handler(
      { searcherName: TEST_SEARCHER_NAME, take: 100 },
      { signal: new AbortController().signal }
    );
    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();
  });

});