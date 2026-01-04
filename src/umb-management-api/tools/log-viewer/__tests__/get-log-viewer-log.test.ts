import GetLogViewerLogTool from "../get/get-log-viewer-log.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("get-log-viewer-log", () => {
  setupTestEnvironment();

  it("should get log viewer logs with default parameters", async () => {
    const result = await GetLogViewerLogTool.handler(
      { take: 100 },
      createMockRequestHandlerExtra()
    );

    // Verify response structure (logs are dynamic, so we verify structure not content)
    expect(result.structuredContent).toBeDefined();
    expect(result.structuredContent).toHaveProperty("items");
    expect(result.structuredContent).toHaveProperty("total");
    expect(Array.isArray(result.structuredContent.items)).toBe(true);
    expect(typeof result.structuredContent.total).toBe("number");
    expect(result.structuredContent.total).toBeGreaterThanOrEqual(0);
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

    // Verify response structure (logs are dynamic, so we verify structure not content)
    expect(result.structuredContent).toBeDefined();
    expect(result.structuredContent).toHaveProperty("items");
    expect(result.structuredContent).toHaveProperty("total");
    expect(Array.isArray(result.structuredContent.items)).toBe(true);
    expect(result.structuredContent.items.length).toBeLessThanOrEqual(10);
    expect(typeof result.structuredContent.total).toBe("number");
  });
});
