import GetSearcherTool from "../get/get-searcher.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { jest } from "@jest/globals";

describe("get-searcher", () => {
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

  it("should list all searchers with default parameters", async () => {
    const result = await GetSearcherTool.handler(
      { take: 100 },
      { signal: new AbortController().signal }
    );
    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();
  });

});