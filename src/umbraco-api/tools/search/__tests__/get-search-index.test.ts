import GetSearchIndexTool from "../get/get-search-index.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateErrorResult,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_INDEX_ALIAS = "Umb_Content";

describe("get-search-index", () => {
  setupTestEnvironment();

  it("should get a search index by alias", async () => {
    const result = await GetSearchIndexTool.handler(
      { indexAlias: TEST_INDEX_ALIAS },
      createMockRequestHandlerExtra()
    );

    const data = validateToolResponse(GetSearchIndexTool, result) as {
      indexAlias: string;
      providerName: string;
      documentCount: number;
    };
    expect(data.indexAlias).toBe(TEST_INDEX_ALIAS);
    expect(data.providerName).toMatchSnapshot();
    expect(data.documentCount).toBeGreaterThan(0);
  });

  it("should handle a non-existent index alias", async () => {
    const result = await GetSearchIndexTool.handler(
      { indexAlias: "_NonExistentIndex" },
      createMockRequestHandlerExtra()
    );

    validateErrorResult(result);
    expect(result).toMatchSnapshot();
  });
});
