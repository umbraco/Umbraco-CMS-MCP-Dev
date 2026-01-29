import DeleteMemberTool from "../delete/delete-member.js";
import { MemberBuilder } from "./helpers/member-builder.js";
import { MemberTestHelper } from "./helpers/member-test-helper.js";
import {
  BLANK_UUID,
  Default_Memeber_TYPE_ID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_MEMBER_NAME = "_Test DeleteMember";

describe("delete-member", () => {
  setupTestEnvironment();

  it("should delete a member by ID", async () => {
    // Create a member
    const builder = await new MemberBuilder()
      .withName(TEST_MEMBER_NAME)
      .withEmail("test@example.com")
      .withUsername("test@example.com")
      .withPassword("test123@Longer")
      .withMemberType(Default_Memeber_TYPE_ID)
      .create();

    const id = builder.getId();

    // Delete the member
    const result = await DeleteMemberTool.handler(
      { id },
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();

    // Verify the member is deleted
    const member = await MemberTestHelper.findMember("test@example.com");
    expect(member).toBeUndefined();
  });

  it("should return error for non-existent ID", async () => {
    const result = await DeleteMemberTool.handler(
      { id: BLANK_UUID },
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
  });
});
