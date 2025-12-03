import GetIndexerTool from "../get/get-indexer.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { jest } from "@jest/globals";

describe("get-indexer", () => {
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

  it("should list all indexes with default parameters", async () => {
    const result = await GetIndexerTool().handler(
      { take: 100 },
      { signal: new AbortController().signal }
    );

    // Normalize documentCount which changes as documents are created/deleted
    const parsed = JSON.parse(result.content[0].text as string);
    if (parsed.items && Array.isArray(parsed.items)) {
      parsed.items = parsed.items.map((item: any) => ({
        ...item,
        documentCount: "NORMALIZED_COUNT"
      }));
    }
    result.content[0].text = JSON.stringify(parsed);

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();
  });
});