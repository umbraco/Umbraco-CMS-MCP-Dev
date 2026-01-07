import GetLogViewerMessageTemplateTool from "../get/get-log-viewer-message-template.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("get-log-viewer-message-template", () => {
  setupTestEnvironment();

  it("should get log viewer message templates with default parameters", async () => {
    const result = await GetLogViewerMessageTemplateTool.handler(
      { skip: undefined, take: 100, startDate: undefined, endDate: undefined },
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's outputSchema
    const content = validateToolResponse(GetLogViewerMessageTemplateTool, result);

    // Verify response structure (message templates are dynamic, so we verify structure not content)
    expect(content).toHaveProperty("items");
    expect(content).toHaveProperty("total");
    expect(Array.isArray(content.items)).toBe(true);
    expect(typeof content.total).toBe("number");
    expect(content.total).toBeGreaterThanOrEqual(0);

    // Verify items have the expected structure
    if (content.items.length > 0) {
      const firstItem = content.items[0];
      expect(firstItem).toHaveProperty("messageTemplate");
      expect(firstItem).toHaveProperty("count");
      expect(typeof firstItem.messageTemplate).toBe("string");
      expect(typeof firstItem.count).toBe("number");
    }
  });

  it("should get log viewer message templates with custom parameters", async () => {
    // Use current date range instead of hardcoded dates
    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);

    const result = await GetLogViewerMessageTemplateTool.handler(
      {
        skip: 0,
        take: 10,
        startDate: oneMonthAgo.toISOString(),
        endDate: now.toISOString(),
      },
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's outputSchema
    const content = validateToolResponse(GetLogViewerMessageTemplateTool, result);

    // Verify response structure (message templates are dynamic, so we verify structure not content)
    expect(content).toHaveProperty("items");
    expect(content).toHaveProperty("total");
    expect(Array.isArray(content.items)).toBe(true);
    expect(content.items.length).toBeLessThanOrEqual(10);
  });
});
