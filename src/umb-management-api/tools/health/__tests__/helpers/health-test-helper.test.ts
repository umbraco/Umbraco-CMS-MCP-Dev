import { HealthTestHelper } from "./health-test-helper.js";
import { jest } from "@jest/globals";

describe("HealthTestHelper", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await HealthTestHelper.cleanup();
  });

  describe("normalizeHealthCheckItems", () => {
    it("should normalize health check items for snapshot testing", () => {
      const mockResult = {
        content: [{
          type: "text",
          text: JSON.stringify({
            items: [
              {
                id: "test-id-123",
                name: "Test Group",
                createDate: "2024-01-01T00:00:00Z",
                updateDate: "2024-01-01T00:00:00Z"
              }
            ]
          })
        }]
      };

      const normalized = HealthTestHelper.normalizeHealthCheckItems(mockResult);

      expect(normalized).toBeDefined();
      expect(normalized.content).toBeDefined();
      expect(Array.isArray(normalized.content)).toBe(true);
    });
  });

  describe("cleanup", () => {
    it("should complete cleanup successfully", async () => {
      // Should not throw
      await expect(HealthTestHelper.cleanup()).resolves.toBeUndefined();
    });
  });
});