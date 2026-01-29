import GetMemberByIdReferencedDescendantsTool from "../get/get-member-by-id-referenced-descendants.js";
import { MemberBuilder } from "./helpers/member-builder.js";
import { MemberTestHelper } from "./helpers/member-test-helper.js";
import {
  Default_Memeber_TYPE_ID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_MEMBER_NAME = "_Test Member Referenced Descendants";
const TEST_MEMBER_EMAIL = "test-referenced-descendants@example.com";

describe("get-member-by-id-referenced-descendants", () => {
  // Note: This is primarily a smoke test as members typically don't have hierarchical descendants
  // The API exists for completeness and potential future use cases with custom member hierarchies
  setupTestEnvironment();

  afterEach(async () => {
    await MemberTestHelper.cleanup(TEST_MEMBER_EMAIL);
  });

  it("should get descendant references for a member", async () => {
    // Smoke test: Create a member for testing (expects no descendants)
    const builder = await new MemberBuilder()
      .withName(TEST_MEMBER_NAME)
      .withEmail(TEST_MEMBER_EMAIL)
      .withUsername(TEST_MEMBER_EMAIL)
      .withPassword("test123@Longer")
      .withMemberType(Default_Memeber_TYPE_ID)
      .create();

    const id = builder.getId();

    const result = await GetMemberByIdReferencedDescendantsTool.handler(
      { id, skip: 0, take: 10 },
      createMockRequestHandlerExtra()
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Validate response against tool's output schema
    const parsed = validateToolResponse(GetMemberByIdReferencedDescendantsTool, result);
    expect(parsed).toHaveProperty('total');
    expect(parsed).toHaveProperty('items');
    expect(Array.isArray(parsed.items)).toBe(true);
    expect(typeof parsed.total).toBe('number');
  });

  it("should handle empty results for member with no descendant references", async () => {
    // Smoke test: Create a member for testing (expects no descendants)
    const builder = await new MemberBuilder()
      .withName(TEST_MEMBER_NAME + "_NoDesc")
      .withEmail("nodesc_" + TEST_MEMBER_EMAIL)
      .withUsername("nodesc_" + TEST_MEMBER_EMAIL)
      .withPassword("test123@Longer")
      .withMemberType(Default_Memeber_TYPE_ID)
      .create();

    const result = await GetMemberByIdReferencedDescendantsTool.handler(
      { id: builder.getId(), skip: 0, take: 10 },
      createMockRequestHandlerExtra()
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Validate response against tool's output schema
    const parsed = validateToolResponse(GetMemberByIdReferencedDescendantsTool, result);
    expect(parsed.total).toBe(0);
    expect(parsed.items).toHaveLength(0);

    // Cleanup the test member
    await MemberTestHelper.cleanup("nodesc_" + TEST_MEMBER_EMAIL);
  });
});