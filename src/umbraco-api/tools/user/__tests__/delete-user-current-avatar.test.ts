import DeleteUserCurrentAvatarTool from "../delete/delete-user-current-avatar.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("delete-user-current-avatar", () => {
  setupTestEnvironment();

  it("should delete the avatar for the current user", async () => {
    // Act
    const result = await DeleteUserCurrentAvatarTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
