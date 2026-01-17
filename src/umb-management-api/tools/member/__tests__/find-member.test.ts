import FindMemberTool from "../get/find-member.js";
import { MemberBuilder } from "./helpers/member-builder.js";
import { MemberTestHelper } from "./helpers/member-test-helper.js";
import {
  Default_Memeber_TYPE_ID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_MEMBER_NAME = "_Test FindMember";
const TEST_MEMBER_EMAIL = "findmember@example.com";
const TEST_MEMBER_USERNAME = "findmember@example.com";

describe("find-member", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await MemberTestHelper.cleanup(TEST_MEMBER_USERNAME);
    await MemberTestHelper.cleanup("findmember2@example.com");
  });

  it("should find a member by username filter", async () => {
    // Create a member
    await new MemberBuilder()
      .withName(TEST_MEMBER_NAME)
      .withEmail(TEST_MEMBER_EMAIL)
      .withUsername(TEST_MEMBER_USERNAME)
      .withPassword("test123@Longer")
      .withMemberType(Default_Memeber_TYPE_ID)
      .create();

    // Use the tool to find by username
    const result = await FindMemberTool.handler(
      { filter: TEST_MEMBER_USERNAME, orderBy: "username", take: 100, memberTypeId: undefined, memberGroupName: undefined, isApproved: undefined, isLockedOut: undefined, orderDirection: undefined, skip: undefined },
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's output schema
    const data = validateToolResponse(FindMemberTool, result);
    expect(data.total).toBeGreaterThan(0);
    const found = data.items.find(
      (m: any) => m.username === TEST_MEMBER_USERNAME
    );
    expect(found).toBeTruthy();
    expect(found!.email).toBe(TEST_MEMBER_EMAIL);
  });

  it("should return no results for a non-existent filter", async () => {
    const result = await FindMemberTool.handler(
      {
        filter: "nonexistentuser_" + Date.now(),
        orderBy: "username",
        take: 100,
        memberTypeId: undefined,
        memberGroupName: undefined,
        isApproved: undefined,
        isLockedOut: undefined,
        orderDirection: undefined,
        skip: undefined,
      },
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's output schema
    const data = validateToolResponse(FindMemberTool, result);
    expect(data.total).toBe(0);
    expect(data.items.length).toBe(0);
  });

  it("should support pagination (take)", async () => {
    // Create two members
    await new MemberBuilder()
      .withName(TEST_MEMBER_NAME)
      .withEmail(TEST_MEMBER_EMAIL)
      .withUsername(TEST_MEMBER_USERNAME)
      .withPassword("test123@Longer")
      .withMemberType(Default_Memeber_TYPE_ID)
      .create();
    await new MemberBuilder()
      .withName(TEST_MEMBER_NAME + "2")
      .withEmail("findmember2@example.com")
      .withUsername("findmember2@example.com")
      .withPassword("test123@Longer")
      .withMemberType(Default_Memeber_TYPE_ID)
      .create();

    // Use the tool to get only one result
    const result = await FindMemberTool.handler(
      { filter: "findmember@example.com", orderBy: "username", take: 1, memberTypeId: undefined, memberGroupName: undefined, isApproved: undefined, isLockedOut: undefined, orderDirection: undefined, skip: undefined },
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's output schema
    const data = validateToolResponse(FindMemberTool, result);
    expect(data.items.length).toBeLessThanOrEqual(1);
  });
});
