import DeleteMemberGroupTool from "../delete/delete-member-group.js";
import { MemberGroupBuilder } from "./helpers/member-group-builder.js";
import { MemberGroupTestHelper } from "./helpers/member-group-helper.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_GROUP_NAME = "_Test Member Group Delete";

describe("delete-member-group", () => {
  setupTestEnvironment();
  it("should delete a member group", async () => {
    const builder = await new MemberGroupBuilder()
      .withName(TEST_GROUP_NAME)
      .create();
    const result = await DeleteMemberGroupTool.handler(
      { id: builder.getId() },
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
    const items = await MemberGroupTestHelper.findMemberGroups(TEST_GROUP_NAME);
    expect(items).toHaveLength(0);
  });

  it("should handle non-existent member group", async () => {
    const result = await DeleteMemberGroupTool.handler(
      { id: BLANK_UUID },
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
  });
});
