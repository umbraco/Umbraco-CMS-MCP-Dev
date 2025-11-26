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

    // Verify response structure - don't snapshot as indexes vary by environment
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");

    const parsed = JSON.parse(result.content[0].text as string);
    expect(parsed.total).toBeGreaterThan(0);
    expect(Array.isArray(parsed.items)).toBe(true);
    expect(parsed.items.length).toBeGreaterThan(0);

    // Verify index structure
    const firstIndex = parsed.items[0];
    expect(firstIndex).toHaveProperty("name");
    expect(firstIndex).toHaveProperty("healthStatus");
    expect(firstIndex).toHaveProperty("canRebuild");
    expect(firstIndex).toHaveProperty("searcherName");
  });

});