import GetSearcherTool from "../get/get-searcher.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-searcher", () => {
  setupTestEnvironment();

  it("should list all searchers with default parameters", async () => {
    const result = await GetSearcherTool.handler(
      { skip: undefined, take: 100 },
      createMockRequestHandlerExtra()
    );
    // Validate response against tool's outputSchema
    const data = validateToolResponse(GetSearcherTool, result);
    expect(data).toMatchSnapshot();
  });

});
