import UpdateUserCurrentProfileTool from "../put/update-user-current-profile.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

// The MCP API user is always created with the default language in the test instance.
const DEFAULT_LANGUAGE_ISO_CODE = "en-US";

describe("update-user-current-profile", () => {
  setupTestEnvironment();

  it("should update the current user's profile", async () => {
    // Act
    const result = await UpdateUserCurrentProfileTool.handler(
      { languageIsoCode: DEFAULT_LANGUAGE_ISO_CODE },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
