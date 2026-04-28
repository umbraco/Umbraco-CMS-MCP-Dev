import GetAllowedMediaTypeTool from "../get/get-allowed.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("allowed-media-type", () => {
  setupTestEnvironment();

  describe("get allowed", () => {
    it("should filter by file extension", async () => {
      const result = await GetAllowedMediaTypeTool.handler({
        fileExtension: 'jpg'
      } as any, createMockRequestHandlerExtra());

      expect(createSnapshotResult(result)).toMatchSnapshot();

      // Validate response against tool's output schema
      const response = validateToolResponse(GetAllowedMediaTypeTool, result);
      expect(Array.isArray(response.items)).toBe(true);
      expect(response.items.length).toBeGreaterThan(0);
    });
  });
});
