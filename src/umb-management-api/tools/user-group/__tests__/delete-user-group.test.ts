import DeleteUserGroupTool from "../delete/delete-user-group.js";
import { UserGroupBuilder } from "./helpers/user-group-builder.js";
import { UserGroupTestHelper } from "./helpers/user-group-helper.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_GROUP_NAME = "_Test User Group Delete";

describe("delete-user-group", () => {
  setupTestEnvironment();

  it("should delete a user group", async () => {
    const builder = await new UserGroupBuilder()
      .withName(TEST_GROUP_NAME)
      .create();
    const result = await DeleteUserGroupTool.handler(
      {
        id: builder.getId(),
      },
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();
    const items = await UserGroupTestHelper.findUserGroups(TEST_GROUP_NAME);
    expect(items).toHaveLength(0);
  });

  it("should handle non-existent user group", async () => {
    const result = await DeleteUserGroupTool.handler(
      {
        id: BLANK_UUID,
      },
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
