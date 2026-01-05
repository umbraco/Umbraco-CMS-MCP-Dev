import GetUserCurrentTool from "../get/get-user-current.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { getUserCurrentResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";

describe("get-user-current", () => {
  setupTestEnvironment();

  it("should get current authenticated user information", async () => {
    // Act
    const result = await GetUserCurrentTool.handler({}, createMockRequestHandlerExtra());

    // Extract user ID for proper normalization
    const parsed = validateStructuredContent(result, getUserCurrentResponse);
    const userId = parsed.id;

    // Assert
    const normalizedResult = createSnapshotResult(result, userId);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should return consistent user information on multiple calls", async () => {
    // Act
    const result1 = await GetUserCurrentTool.handler({}, createMockRequestHandlerExtra());
    const result2 = await GetUserCurrentTool.handler({}, createMockRequestHandlerExtra());

    // Extract user ID for proper normalization
    const parsed1 = validateStructuredContent(result1, getUserCurrentResponse);
    const userId = parsed1.id;

    // Assert
    const normalizedResult1 = createSnapshotResult(result1, userId);
    const normalizedResult2 = createSnapshotResult(result2, userId);

    expect(normalizedResult1).toEqual(normalizedResult2);
  });
});
