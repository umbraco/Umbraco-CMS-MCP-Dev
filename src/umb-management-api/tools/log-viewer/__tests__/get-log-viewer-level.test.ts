import GetLogViewerLevelTool from "../get/get-log-viewer-level.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("get-log-viewer-level", () => {
  setupTestEnvironment();

  it("should get log viewer levels with default parameters", async () => {
    const result = await GetLogViewerLevelTool.handler(
      { take: 100 },
      createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();
  });

  it("should get log viewer levels with custom pagination", async () => {
    const result = await GetLogViewerLevelTool.handler(
      {
        skip: 1,
        take: 2,
      },
      createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();
  });
});
