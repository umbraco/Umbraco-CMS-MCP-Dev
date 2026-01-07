import GetLogViewerLevelCountTool from "../get/get-log-viewer-level-count.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("get-log-viewer-level-count", () => {
  setupTestEnvironment();

  it("should get log viewer level counts with default parameters", async () => {
    const result = await GetLogViewerLevelCountTool.handler(
      { startDate: undefined, endDate: undefined },
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's outputSchema
    const content = validateToolResponse(GetLogViewerLevelCountTool, result);

    // Verify response structure (counts are dynamic, so we verify structure not exact values)
    expect(content).toHaveProperty("debug");
    expect(content).toHaveProperty("error");
    expect(content).toHaveProperty("fatal");
    expect(content).toHaveProperty("information");
    expect(content).toHaveProperty("warning");

    // Verify all counts are non-negative numbers
    expect(typeof content.debug).toBe("number");
    expect(typeof content.error).toBe("number");
    expect(typeof content.fatal).toBe("number");
    expect(typeof content.information).toBe("number");
    expect(typeof content.warning).toBe("number");
    expect(content.debug).toBeGreaterThanOrEqual(0);
    expect(content.error).toBeGreaterThanOrEqual(0);
    expect(content.fatal).toBeGreaterThanOrEqual(0);
    expect(content.information).toBeGreaterThanOrEqual(0);
    expect(content.warning).toBeGreaterThanOrEqual(0);
  });

  it("should get log viewer level counts with date range", async () => {
    const result = await GetLogViewerLevelCountTool.handler(
      {
        startDate: "2024-01-01T00:00:00Z",
        endDate: "2024-12-31T23:59:59Z",
      },
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's outputSchema
    const content = validateToolResponse(GetLogViewerLevelCountTool, result);

    // Verify response structure (counts are dynamic, so we verify structure not exact values)
    expect(content).toHaveProperty("debug");
    expect(content).toHaveProperty("error");
    expect(content).toHaveProperty("fatal");
    expect(content).toHaveProperty("information");
    expect(content).toHaveProperty("warning");
  });
});
