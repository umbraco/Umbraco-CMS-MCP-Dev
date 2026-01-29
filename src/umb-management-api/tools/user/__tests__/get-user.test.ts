import GetUserTool from "../get/get-user.js";
import { getUserQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

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
    const parsed = validateToolResponse(GetUserTool, result);
    expect(parsed.items.length).toBeLessThanOrEqual(5);
  });
});
