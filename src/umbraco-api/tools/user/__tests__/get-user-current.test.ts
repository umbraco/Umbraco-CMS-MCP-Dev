import GetUserCurrentTool from "../get/get-user-current.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-user-current", () => {
  setupTestEnvironment();

  it("should get current authenticated user information", async () => {
    // Act
    const result = await GetUserCurrentTool.handler({}, createMockRequestHandlerExtra());

    // Extract user data for validation
    const parsed = validateToolResponse(GetUserCurrentTool, result);

    // Assert structure (not user-specific values, which differ between environments)
    expect(parsed).toBeDefined();
    expect(parsed.id).toBeDefined();
    expect(parsed.email).toBeDefined();
    expect(parsed.name).toBeDefined();
    expect(parsed.isAdmin).toBe(true);
    expect(parsed.languageIsoCode).toBe("en-US");
  });

  it("should return consistent user information on multiple calls", async () => {
    // Act
    const result1 = await GetUserCurrentTool.handler({}, createMockRequestHandlerExtra());
    const result2 = await GetUserCurrentTool.handler({}, createMockRequestHandlerExtra());

    // Extract user ID for proper normalization
    const parsed1 = validateToolResponse(GetUserCurrentTool, result1);
    const userId = parsed1.id;

    // Assert
    const normalizedResult1 = createSnapshotResult(result1, userId);
    const normalizedResult2 = createSnapshotResult(result2, userId);

    expect(normalizedResult1).toEqual(normalizedResult2);
  });
});
