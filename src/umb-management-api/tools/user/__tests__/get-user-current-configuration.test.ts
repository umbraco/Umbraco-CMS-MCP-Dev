import GetUserCurrentConfigurationTool from "../get/get-user-current-configuration.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-user-current-configuration", () => {
  setupTestEnvironment();

  it("should get the current user configuration", async () => {
    // Act
    const result = await GetUserCurrentConfigurationTool.handler({}, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify expected properties exist
    const parsed = validateToolResponse(GetUserCurrentConfigurationTool, result);
    expect(parsed).toHaveProperty("keepUserLoggedIn");
    expect(parsed).toHaveProperty("passwordConfiguration");
  });
});
