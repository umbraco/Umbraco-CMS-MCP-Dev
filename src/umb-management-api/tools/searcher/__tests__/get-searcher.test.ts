import GetSearcherTool from "../get/get-searcher.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { withCursorPagination } from "@umbraco-cms/mcp-server-sdk";

describe("get-searcher", () => {
  setupTestEnvironment();

  it("should list all searchers with default parameters", async () => {
    const cursorTool = withCursorPagination(GetSearcherTool);
    const result = await cursorTool.handler(
      {},
      createMockRequestHandlerExtra()
    );
    // Validate response against tool's outputSchema
    const data = validateToolResponse(cursorTool, result);
    expect(data).toMatchSnapshot();
  });

});
