import GetUserCurrentPermissionsDocumentTool from "../get/get-user-current-permissions-document.js";
import { getUserCurrentPermissionsDocumentQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-user-current-permissions-document", () => {
  setupTestEnvironment();

  it("should get current user document permissions", async () => {
    // Act
    const params = getUserCurrentPermissionsDocumentQueryParams.parse({});
    const result = await GetUserCurrentPermissionsDocumentTool.handler(params as any, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle non-existent document ID", async () => {
    // Act
    const params = getUserCurrentPermissionsDocumentQueryParams.parse({
      id: [BLANK_UUID]
    });
    const result = await GetUserCurrentPermissionsDocumentTool.handler(params as any, createMockRequestHandlerExtra());

    // Assert - This may return empty results or error depending on API behavior
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});
