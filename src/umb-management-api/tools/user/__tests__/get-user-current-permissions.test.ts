import GetUserCurrentPermissionsTool from "../get/get-user-current-permissions.js";
import { getUserCurrentPermissionsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  normalizeErrorResponse,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-user-current-permissions", () => {
  setupTestEnvironment();

  it("should get current user permissions", async () => {
    // Act
    const params = getUserCurrentPermissionsQueryParams.parse({});
    const result = await GetUserCurrentPermissionsTool.handler(params as any, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should return consistent permissions on multiple calls", async () => {
    // Act
    const params = getUserCurrentPermissionsQueryParams.parse({});
    const result1 = await GetUserCurrentPermissionsTool.handler(params as any, createMockRequestHandlerExtra());
    const result2 = await GetUserCurrentPermissionsTool.handler(params as any, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult1 = createSnapshotResult(result1);
    const normalizedResult2 = createSnapshotResult(result2);

    expect(normalizedResult1).toEqual(normalizedResult2);
  });

  it("should handle non-existent ID", async () => {
    // Act
    const params = getUserCurrentPermissionsQueryParams.parse({
      id: [BLANK_UUID]
    });
    const result = await GetUserCurrentPermissionsTool.handler(params as any, createMockRequestHandlerExtra());

    // Assert - This may return empty results or error depending on API behavior
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});
