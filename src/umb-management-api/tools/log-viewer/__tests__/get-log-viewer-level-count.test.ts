import GetLogViewerLevelCountTool from "../get/get-log-viewer-level-count.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("get-log-viewer-level-count", () => {
  setupTestEnvironment();

  it("should get log viewer level counts with default parameters", async () => {
    const result = await GetLogViewerLevelCountTool.handler(
      { startDate: undefined, endDate: undefined },
      createMockRequestHandlerExtra()
    );

    // Verify response structure (counts are dynamic, so we verify structure not exact values)
    expect(result.structuredContent).toBeDefined();
    const content = result.structuredContent!;
    expect(content).toHaveProperty("debug");
    expect(content).toHaveProperty("error");
    expect(content).toHaveProperty("fatal");
    expect(content).toHaveProperty("information");
    expect(content).toHaveProperty("warning");

    // Verify all counts are non-negative numbers
    const typedContent = content as { debug: number; error: number; fatal: number; information: number; warning: number };
    expect(typeof typedContent.debug).toBe("number");
    expect(typeof typedContent.error).toBe("number");
    expect(typeof typedContent.fatal).toBe("number");
    expect(typeof typedContent.information).toBe("number");
    expect(typeof typedContent.warning).toBe("number");
    expect(typedContent.debug).toBeGreaterThanOrEqual(0);
    expect(typedContent.error).toBeGreaterThanOrEqual(0);
    expect(typedContent.fatal).toBeGreaterThanOrEqual(0);
    expect(typedContent.information).toBeGreaterThanOrEqual(0);
    expect(typedContent.warning).toBeGreaterThanOrEqual(0);
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
