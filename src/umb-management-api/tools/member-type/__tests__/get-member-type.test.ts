import { MemberTypeTestHelper } from "./helpers/member-type-helper.js";
import GetMemberTypeTool from "../get/get-member-type.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { MemberTypeBuilder } from "./helpers/member-type-builder.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

describe("get-member-type", () => {
  setupTestEnvironment();

  const TEST_MEMBER_TYPE_NAME = "_Test Member Type";

  afterEach(async () => {
    await MemberTypeTestHelper.cleanup(TEST_MEMBER_TYPE_NAME);
  });

  it("should get a member type by id", async () => {
    // Create a member type first
    const builder = await new MemberTypeBuilder()
      .withName(TEST_MEMBER_TYPE_NAME)
      .withDescription("Test member type description")
      .withAllowedAsRoot(true)
      .create();

    const result = await GetMemberTypeTool.handler(
      {
        id: builder.getId(),
      },
      createMockRequestHandlerExtra()
    );

    // Normalize and verify response
    expect(createSnapshotResult(result, builder.getId())).toMatchSnapshot();
  });

  it("should handle non-existent member type", async () => {
    const result = await GetMemberTypeTool.handler(
      {
        id: BLANK_UUID,
      },
      createMockRequestHandlerExtra()
    );

    expect(result).toMatchSnapshot();
  });
});
