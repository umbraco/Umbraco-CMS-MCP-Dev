import { MemberTypeTestHelper } from "./helpers/member-type-helper.js";
import CreateMemberTypeTool from "../post/create-member-type.js";
import {
  createSnapshotResult,
  normalizeErrorResponse,
} from "@/test-helpers/create-snapshot-result.js";
import { MemberTypeBuilder } from "./helpers/member-type-builder.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

describe("create-member-type", () => {
  setupTestEnvironment();

  const TEST_MEMBER_TYPE_NAME = "_Test Member Type";

  afterEach(async () => {
    await MemberTypeTestHelper.cleanup(TEST_MEMBER_TYPE_NAME);
  });

  it("should create a member type", async () => {
    const builder = new MemberTypeBuilder()
      .withName(TEST_MEMBER_TYPE_NAME)
      .withDescription("Test member type description")
      .withAllowedAsRoot(true);

    const result = await CreateMemberTypeTool.handler(
      builder.build() as Parameters<typeof CreateMemberTypeTool.handler>[0],
      createMockRequestHandlerExtra()
    );

    // Normalize and verify response
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();

    // Verify the member type was created
    const items = await MemberTypeTestHelper.findMemberTypes(
      TEST_MEMBER_TYPE_NAME
    );
    expect(items.length).toBe(1);
    expect(items[0].name).toBe(TEST_MEMBER_TYPE_NAME);
  });

  it("should handle invalid member type data", async () => {
    const invalidModel = {
      name: TEST_MEMBER_TYPE_NAME,
      // Missing required fields
    };

    const result = await CreateMemberTypeTool.handler(
      invalidModel as any,
      createMockRequestHandlerExtra()
    );

    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });
}); 