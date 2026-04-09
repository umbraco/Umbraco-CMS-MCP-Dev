import GetSearcherBySearcherNameQueryTool from "../get/get-searcher-by-searcher-name-query.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { withCursorPagination } from "@umbraco-cms/mcp-server-sdk";

const TEST_SEARCHER_NAME = "ExternalIndex";

describe("get-searcher-by-searcher-name-query", () => {
  setupTestEnvironment();

  it("should get searcher query results by searcher name", async () => {
    const cursorTool = withCursorPagination(GetSearcherBySearcherNameQueryTool);
    const result = await cursorTool.handler(
      { searcherName: TEST_SEARCHER_NAME, term: undefined },
      createMockRequestHandlerExtra()
    );
    // Validate response against tool's outputSchema
    const data = validateToolResponse(cursorTool, result);
    expect(data).toMatchSnapshot();
  });

});
