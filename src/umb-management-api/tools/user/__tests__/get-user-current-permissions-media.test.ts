import GetUserCurrentPermissionsMediaTool from "../get/get-user-current-permissions-media.js";
import { getUserCurrentPermissionsMediaQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  normalizeErrorResponse,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-user-current-permissions-media", () => {
  setupTestEnvironment();

  it("should get current user media permissions", async () => {
    // Act
    const params = getUserCurrentPermissionsMediaQueryParams.parse({});
    const result = await GetUserCurrentPermissionsMediaTool.handler(params as any, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle non-existent media ID", async () => {
    // Act
    const params = getUserCurrentPermissionsMediaQueryParams.parse({
      id: [BLANK_UUID]
    });
    const result = await GetUserCurrentPermissionsMediaTool.handler(params as any, createMockRequestHandlerExtra());

    // Assert - This may return empty results or error depending on API behavior
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});
