import { describe, it } from "@jest/globals";
import { setupConsoleMock, runScenarioTest } from "@umbraco-cms/mcp-server-sdk/evals";

const USER_PROFILE_TOOLS = [
  // User information
  "get-user-current",
  "get-user-current-configuration",
  "get-user-current-permissions",
  "get-user-current-permissions-document",
  "get-user-current-permissions-media",
  "get-user-current-login-providers",
  // Avatar management
  "create-temporary-file",
  "upload-user-current-avatar",
  // Search (for admin users)
  "find-user"
] as const;

describe("user profile eval tests", () => {
  setupConsoleMock();

  it("should retrieve user profile information and permissions",
    runScenarioTest({
      prompt: `Complete these tasks in order:
- Get the current user's basic information
- Get the current user's configuration settings
- Get the current user's general permissions
- Get the current user's document permissions
- Get the current user's media permissions
- Get the current user's available login providers
- Summarize the permissions you found
- When done, say 'The user profile workflow has completed successfully'`,
      tools: USER_PROFILE_TOOLS,
      requiredTools: [
        "get-user-current",
        "get-user-current-permissions",
        "get-user-current-permissions-document",
        "get-user-current-permissions-media"
      ],
      successPattern: "user profile workflow has completed successfully",
      options: { maxTurns: 15 }
    }),
    120000
  );

  it("should upload and manage user avatar",
    runScenarioTest({
      prompt: `Complete these tasks in order:
- Get the current user information to see their current avatar status
- Create a temporary file for a test avatar image (use a 1x1 pixel PNG as base64: iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==, name it "avatar.png")
- Upload the temporary file as the current user's avatar
- Get the user information again to verify the avatar was set
- When all tasks are complete, say 'The avatar management workflow has completed successfully'`,
      tools: USER_PROFILE_TOOLS,
      requiredTools: [
        "get-user-current",
        "create-temporary-file",
        "upload-user-current-avatar"
      ],
      successPattern: "avatar management workflow has completed successfully",
      options: { maxTurns: 12 },
    }),
    120000
  );
});
