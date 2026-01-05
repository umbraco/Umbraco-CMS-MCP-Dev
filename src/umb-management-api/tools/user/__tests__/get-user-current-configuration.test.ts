import GetUserCurrentConfigurationTool from "../get/get-user-current-configuration.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { getUserCurrentConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";

describe("get-user-current-configuration", () => {
  setupTestEnvironment();

  it("should get the current user configuration", async () => {
    // Act
    const result = await GetUserCurrentConfigurationTool.handler({}, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify expected properties exist
    const parsed = validateStructuredContent(result, getUserCurrentConfigurationResponse);
    expect(parsed).toHaveProperty("keepUserLoggedIn");
    expect(parsed).toHaveProperty("passwordConfiguration");
  });
});
