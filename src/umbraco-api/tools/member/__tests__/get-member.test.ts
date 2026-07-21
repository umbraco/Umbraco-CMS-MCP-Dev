import GetMemberTool from "../get/get-member.js";
import { MemberBuilder } from "./helpers/member-builder.js";
import { MemberTestHelper } from "./helpers/member-test-helper.js";
import {
  BLANK_UUID,
  Default_Memeber_TYPE_ID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_MEMBER_NAME = "_Test GetMember";

describe("get-member", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await MemberTestHelper.cleanup("test@example.com");
  });

  it("should get a member by ID", async () => {
    // Create a member
    const builder = await new MemberBuilder()
      .withName(TEST_MEMBER_NAME)
      .withEmail("test@example.com")
      .withUsername("test@example.com")
      .withPassword("test123@Longer")
      .withMemberType(Default_Memeber_TYPE_ID)
      .create();

    const id = builder.getId();

    // Get by ID
    const result = await GetMemberTool.handler(
      { id },
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's output schema
    const member = validateToolResponse(GetMemberTool, result);

    expect(member.id).toBe(id);
    expect(member.username).toBe("test@example.com");
  });

  it("should return error for non-existent ID", async () => {
    const result = await GetMemberTool.handler(
      { id: BLANK_UUID },
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBe(true);
  });
});
