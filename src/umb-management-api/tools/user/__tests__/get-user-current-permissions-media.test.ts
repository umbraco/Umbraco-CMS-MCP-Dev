import GetUserCurrentPermissionsMediaTool from "../get/get-user-current-permissions-media.js";
import { createSnapshotResult, normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { getUserCurrentPermissionsMediaQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

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
