import GetIndexerByIndexNameTool from "../get/get-indexer-by-index-name.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { jest } from "@jest/globals";

const TEST_INDEX_NAME = "ExternalIndex";

describe("get-indexer-by-index-name", () => {
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

  it("should get index by name", async () => {
    const result = await GetIndexerByIndexNameTool.handler(
      { indexName: TEST_INDEX_NAME },
      { signal: new AbortController().signal }
    );

    // Normalize documentCount which changes as documents are created/deleted
    const parsed = JSON.parse(result.content[0].text as string);
    parsed.documentCount = "NORMALIZED_COUNT";
    result.content[0].text = JSON.stringify(parsed);

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();
  });

});