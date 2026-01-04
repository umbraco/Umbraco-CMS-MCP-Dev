import { MemberBuilder } from "./helpers/member-builder.js";
import { MemberTestHelper } from "./helpers/member-test-helper.js";
import {
  Default_Memeber_TYPE_ID,
  BLANK_UUID,
} from "../../../../constants/constants.js";
import GetMembersByIdArrayTool from "../get/get-member-by-id-array.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_MEMBER_NAME = "_Test GetMemberByIdArray";
const TEST_MEMBER_EMAIL = "test-get-by-id-array@example.com";

interface Member {
  id: string;
  kind: string;
  memberType: {
    collection: null;
    icon: string;
    id: string;
  };
  variants: Array<{
    culture: null;
    name: string;
  }>;
}

describe("get-member-by-id-array", () => {
  setupTestEnvironment();

  let createdMemberEmails: string[] = [];

  beforeEach(() => {
    createdMemberEmails = [];
  });

  afterEach(async () => {
    // Clean up all created members
    for (const email of createdMemberEmails) {
      await MemberTestHelper.cleanup(email);
    }
  });

  it("should get members by their IDs", async () => {
    // Create test members
    const member1 = await new MemberBuilder()
      .withName(TEST_MEMBER_NAME + " 1")
      .withEmail(TEST_MEMBER_EMAIL + "1")
      .withUsername(TEST_MEMBER_EMAIL + "1")
      .withPassword("test123@Longer")
      .withMemberType(Default_Memeber_TYPE_ID)
      .create();
    createdMemberEmails.push(TEST_MEMBER_EMAIL + "1");

    const member2 = await new MemberBuilder()
      .withName(TEST_MEMBER_NAME + " 2")
      .withEmail(TEST_MEMBER_EMAIL + "2")
      .withUsername(TEST_MEMBER_EMAIL + "2")
      .withPassword("test123@Longer")
      .withMemberType(Default_Memeber_TYPE_ID)
      .create();
    createdMemberEmails.push(TEST_MEMBER_EMAIL + "2");

    const memberIds = [member1.getId(), member2.getId()];

    // Get members by IDs
    const result = await GetMembersByIdArrayTool.handler(
      { id: memberIds },
      createMockRequestHandlerExtra()
    );

    const members = ((result.structuredContent as any)?.items ?? []) as Member[];
    expect(members).toHaveLength(2);
    expect(members.map((m) => m.id)).toEqual(expect.arrayContaining(memberIds));
  });

  it("should return empty array when no IDs are provided", async () => {
    const result = await GetMembersByIdArrayTool.handler(
      { id: [] },
      createMockRequestHandlerExtra()
    );

    const members = ((result.structuredContent as any)?.items ?? []) as Member[];
    expect(members).toEqual([]);
  });

  it("should handle non-existent member IDs gracefully", async () => {
    const result = await GetMembersByIdArrayTool.handler(
      { id: [BLANK_UUID] },
      createMockRequestHandlerExtra()
    );

    const members = ((result.structuredContent as any)?.items ?? []) as Member[];
    expect(members).toEqual([]);
  });

  it("should handle mixed valid and invalid IDs", async () => {
    // Create a test member
    const member = await new MemberBuilder()
      .withName(TEST_MEMBER_NAME)
      .withEmail(TEST_MEMBER_EMAIL)
      .withUsername(TEST_MEMBER_EMAIL)
      .withPassword("test123@Longer")
      .withMemberType(Default_Memeber_TYPE_ID)
      .create();
    createdMemberEmails.push(TEST_MEMBER_EMAIL);

    const memberIds = [member.getId(), BLANK_UUID];

    const result = await GetMembersByIdArrayTool.handler(
      { id: memberIds },
      createMockRequestHandlerExtra()
    );

    const members = ((result.structuredContent as any)?.items ?? []) as Member[];
    expect(members).toHaveLength(1);
    expect(members[0].id).toBe(member.getId());
  });
});
