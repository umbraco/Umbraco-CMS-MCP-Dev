import GetUserConfigurationTool from "../get/get-user-configuration.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

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
