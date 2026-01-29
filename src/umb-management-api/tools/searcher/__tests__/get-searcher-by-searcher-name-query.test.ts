import GetSearcherBySearcherNameQueryTool from "../get/get-searcher-by-searcher-name-query.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_SEARCHER_NAME = "ExternalIndex";

describe("get-searcher-by-searcher-name-query", () => {
  setupTestEnvironment();

  it("should get searcher query results by searcher name", async () => {
    const result = await GetSearcherBySearcherNameQueryTool.handler(
      { searcherName: TEST_SEARCHER_NAME, term: undefined, skip: undefined, take: 100 },
      createMockRequestHandlerExtra()
    );
    // Validate response against tool's outputSchema
    const data = validateToolResponse(GetSearcherBySearcherNameQueryTool, result);
    expect(data).toMatchSnapshot();
  });

});
