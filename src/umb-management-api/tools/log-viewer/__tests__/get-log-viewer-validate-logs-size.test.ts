import GetLogViewerValidateLogsSizeTool from "../get/get-log-viewer-validate-logs-size.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-log-viewer-validate-logs-size", () => {
  setupTestEnvironment();

  it("should validate logs size with default parameters", async () => {
    const result = await GetLogViewerValidateLogsSizeTool.handler(
      { startDate: undefined, endDate: undefined },
      createMockRequestHandlerExtra()
    );

    // Verify operation result using snapshot
    expect(result).toMatchSnapshot();
  });

  it("should validate logs size with custom date range", async () => {
    // Use current date range instead of hardcoded dates
    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);

    const result = await GetLogViewerValidateLogsSizeTool.handler(
      {
        startDate: oneMonthAgo.toISOString(),
        endDate: now.toISOString(),
      },
      createMockRequestHandlerExtra()
    );

    // Verify operation result using snapshot
    expect(result).toMatchSnapshot();
  });
});
