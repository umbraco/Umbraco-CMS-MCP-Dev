import GetUserTool from "../get/get-user.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { getUserQueryParams, getUserResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";

describe("get-user", () => {
  setupTestEnvironment();

  it("should get users list with default parameters", async () => {
    // Act
    const params = getUserQueryParams.parse({ skip: 0, take: 10 });
    const result = await GetUserTool.handler(params as any, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should get users with pagination", async () => {
    // Act
    const params = getUserQueryParams.parse({ skip: 0, take: 5 });
    const result = await GetUserTool.handler(params as any, createMockRequestHandlerExtra());

    // Assert
    const parsed = validateStructuredContent(result, getUserResponse);
    expect(parsed.items.length).toBeLessThanOrEqual(5);
  });
});
