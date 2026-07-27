import GetUserConfigurationTool from "../get/get-user-configuration.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-user-configuration", () => {
  setupTestEnvironment();

  it("should get the user configuration", async () => {
    // Act
    const result = await GetUserConfigurationTool.handler({}, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify expected properties exist
    const parsed = validateToolResponse(GetUserConfigurationTool, result);
    expect(parsed).toHaveProperty("canInviteUsers");
    expect(parsed).toHaveProperty("passwordConfiguration");
  });
});
