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
        take: 100,
        fileExtension: 'jpg'
      } as any, createMockRequestHandlerExtra());

      expect(createSnapshotResult(result)).toMatchSnapshot();

      // Validate response against tool's output schema
      const response = validateToolResponse(GetAllowedMediaTypeTool, result);
      expect(Array.isArray(response.items)).toBe(true);

      // Verify all returned items include jpg in their extensions
      response.items.forEach((item: any) => {
        expect(item.name).toContain('Image');
      });
    });
  });
});
