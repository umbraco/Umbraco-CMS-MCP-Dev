import GetSearcherTool from "../get/get-searcher.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("get-searcher", () => {
  setupTestEnvironment();

  it("should list all searchers with default parameters", async () => {
    const result = await GetSearcherTool.handler(
      { take: 100 },
      createMockRequestHandlerExtra()
    );
    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();
  });

});
