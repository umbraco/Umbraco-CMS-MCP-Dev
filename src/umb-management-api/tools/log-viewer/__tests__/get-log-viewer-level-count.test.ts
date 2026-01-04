import GetLogViewerLevelCountTool from "../get/get-log-viewer-level-count.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("get-log-viewer-level-count", () => {
  setupTestEnvironment();

  it("should get log viewer level counts with default parameters", async () => {
    const result = await GetLogViewerLevelCountTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Verify response structure (counts are dynamic, so we verify structure not exact values)
    expect(result.structuredContent).toBeDefined();
    expect(result.structuredContent).toHaveProperty("debug");
    expect(result.structuredContent).toHaveProperty("error");
    expect(result.structuredContent).toHaveProperty("fatal");
    expect(result.structuredContent).toHaveProperty("information");
    expect(result.structuredContent).toHaveProperty("warning");

    // Verify all counts are non-negative numbers
    expect(typeof result.structuredContent.debug).toBe("number");
    expect(typeof result.structuredContent.error).toBe("number");
    expect(typeof result.structuredContent.fatal).toBe("number");
    expect(typeof result.structuredContent.information).toBe("number");
    expect(typeof result.structuredContent.warning).toBe("number");
    expect(result.structuredContent.debug).toBeGreaterThanOrEqual(0);
    expect(result.structuredContent.error).toBeGreaterThanOrEqual(0);
    expect(result.structuredContent.fatal).toBeGreaterThanOrEqual(0);
    expect(result.structuredContent.information).toBeGreaterThanOrEqual(0);
    expect(result.structuredContent.warning).toBeGreaterThanOrEqual(0);
  });

  it("should get log viewer level counts with date range", async () => {
    const result = await GetLogViewerLevelCountTool.handler(
      {
        startDate: "2024-01-01T00:00:00Z",
        endDate: "2024-12-31T23:59:59Z",
      },
      createMockRequestHandlerExtra()
    );

    // Verify response structure (counts are dynamic, so we verify structure not exact values)
    expect(result.structuredContent).toBeDefined();
    expect(result.structuredContent).toHaveProperty("debug");
    expect(result.structuredContent).toHaveProperty("error");
    expect(result.structuredContent).toHaveProperty("fatal");
    expect(result.structuredContent).toHaveProperty("information");
    expect(result.structuredContent).toHaveProperty("warning");
  });
});
