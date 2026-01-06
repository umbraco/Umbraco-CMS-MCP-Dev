import GetAllowedMediaTypeTool from "../get/get-allowed.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";

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
