import RebuildSearchIndexTool from "../put/rebuild-search-index.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateErrorResult,
} from "@umbraco-cms/mcp-server-sdk/testing";

// Members index is empty in the demo site, so rebuilding it is cheap and side-effect free.
const TEST_INDEX_ALIAS = "Umb_Members";

describe("rebuild-search-index", () => {
  setupTestEnvironment();

  it("should trigger a rebuild of a single index", async () => {
    const result = await RebuildSearchIndexTool.handler(
      { indexAlias: TEST_INDEX_ALIAS },
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();
  });

  it("should handle a non-existent index alias", async () => {
    const result = await RebuildSearchIndexTool.handler(
      { indexAlias: "_NonExistentIndex" },
      createMockRequestHandlerExtra()
    );

    validateErrorResult(result);
    expect(result).toMatchSnapshot();
  });
});
