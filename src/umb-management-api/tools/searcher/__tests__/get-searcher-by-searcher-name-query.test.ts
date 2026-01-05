import GetSearcherBySearcherNameQueryTool from "../get/get-searcher-by-searcher-name-query.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

const TEST_SEARCHER_NAME = "ExternalIndex";

describe("get-searcher-by-searcher-name-query", () => {
  setupTestEnvironment();

  it("should get searcher query results by searcher name", async () => {
    const result = await GetSearcherBySearcherNameQueryTool.handler(
      { searcherName: TEST_SEARCHER_NAME, take: 100 },
      createMockRequestHandlerExtra()
    );
    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();
  });

});
