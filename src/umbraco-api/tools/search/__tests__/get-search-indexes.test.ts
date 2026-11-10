import GetSearchIndexesTool from "../get/get-search-indexes.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-search-indexes", () => {
  setupTestEnvironment();

  it("should list the registered search indexes", async () => {
    const result = await GetSearchIndexesTool.handler({}, createMockRequestHandlerExtra());

    const data = validateToolResponse(GetSearchIndexesTool, result) as {
      total: number;
      items: { indexAlias: string; providerName: string }[];
    };

    // documentCount / healthStatus depend on index state, so snapshot only the stable parts
    expect(
      data.items.map(({ indexAlias, providerName }) => ({ indexAlias, providerName }))
    ).toMatchSnapshot();
    expect(data.total).toBe(data.items.length);
  });
});
