import GetLogViewerLogTool from "../get/get-log-viewer-log.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-log-viewer-log", () => {
  setupTestEnvironment();

  it("should get log viewer logs with default parameters", async () => {
    const result = await GetLogViewerLogTool.handler(
      { skip: undefined, take: 100, orderDirection: undefined, filterExpression: undefined, logLevel: undefined, startDate: undefined, endDate: undefined },
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's outputSchema
    const content = validateToolResponse(GetLogViewerLogTool, result);

    // Verify response structure (logs are dynamic, so we verify structure not content)
    expect(content).toHaveProperty("items");
    expect(content).toHaveProperty("total");
    expect(Array.isArray(content.items)).toBe(true);
    expect(typeof content.total).toBe("number");
    expect(content.total).toBeGreaterThanOrEqual(0);
  });

  it("should get log viewer logs with custom parameters", async () => {
    // Use current date range instead of hardcoded 2024
    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);

    const result = await GetLogViewerLogTool.handler(
      {
        skip: 0,
        take: 10,
        orderDirection: "Descending",
        filterExpression: "",
        logLevel: ["Error", "Warning", "Information"],
        startDate: oneMonthAgo.toISOString(),
        endDate: now.toISOString(),
      },
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's outputSchema
    const content = validateToolResponse(GetLogViewerLogTool, result);

    // Verify response structure (logs are dynamic, so we verify structure not content)
    expect(content).toHaveProperty("items");
    expect(content).toHaveProperty("total");
    expect(Array.isArray(content.items)).toBe(true);
    expect(content.items.length).toBeLessThanOrEqual(10);
    expect(typeof content.total).toBe("number");
  });
});
