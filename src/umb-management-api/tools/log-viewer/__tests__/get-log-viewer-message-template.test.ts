import GetLogViewerMessageTemplateTool from "../get/get-log-viewer-message-template.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("get-log-viewer-message-template", () => {
  setupTestEnvironment();

  it("should get log viewer message templates with default parameters", async () => {
    const result = await GetLogViewerMessageTemplateTool.handler(
      { take: 100 },
      createMockRequestHandlerExtra()
    );

    // Verify response structure (message templates are dynamic, so we verify structure not content)
    expect(result.structuredContent).toBeDefined();
    expect(result.structuredContent).toHaveProperty("items");
    expect(result.structuredContent).toHaveProperty("total");
    expect(Array.isArray(result.structuredContent.items)).toBe(true);
    expect(typeof result.structuredContent.total).toBe("number");
    expect(result.structuredContent.total).toBeGreaterThanOrEqual(0);

    // Verify items have the expected structure
    if (result.structuredContent.items.length > 0) {
      const firstItem = result.structuredContent.items[0];
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

    // Verify response structure (message templates are dynamic, so we verify structure not content)
    expect(result.structuredContent).toBeDefined();
    expect(result.structuredContent).toHaveProperty("items");
    expect(result.structuredContent).toHaveProperty("total");
    expect(Array.isArray(result.structuredContent.items)).toBe(true);
    expect(result.structuredContent.items.length).toBeLessThanOrEqual(10);
  });
});
