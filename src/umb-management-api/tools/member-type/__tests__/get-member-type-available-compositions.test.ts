import GetMemberTypeAvailableCompositionsTool from "../post/get-member-type-available-compositions.js";
import { MemberTypeBuilder } from "./helpers/member-type-builder.js";
import { MemberTypeTestHelper } from "./helpers/member-type-helper.js";
import { MemberTypeCompositionResponseModel } from "@/umb-management-api/schemas/index.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_MEMBER_TYPE_NAME = "_Test MemberType Available";
const TEST_COMPOSITION_NAME = "_Test Available Composition";

describe("get-member-type-available-compositions", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any test member types
    await MemberTypeTestHelper.cleanup(TEST_MEMBER_TYPE_NAME);
    await MemberTypeTestHelper.cleanup(TEST_COMPOSITION_NAME);
  });

  it("should get available compositions for a member type", async () => {
    // Create a member type that will be available as a composition
    await new MemberTypeBuilder().withName(TEST_COMPOSITION_NAME).create();

    // Create a member type to test available compositions for
    const memberTypeBuilder = await new MemberTypeBuilder()
      .withName(TEST_MEMBER_TYPE_NAME)
      .create();

    // Get the available compositions
    const result = await GetMemberTypeAvailableCompositionsTool.handler(
      {
        id: memberTypeBuilder.getId(),
        currentPropertyAliases: [],
        currentCompositeIds: [],
      },
      createMockRequestHandlerExtra()
    );

    // Parse and filter just our test composition
    const items = ((result.structuredContent as any)?.items ?? []) as MemberTypeCompositionResponseModel[];
    const testComposition = items.find(
      (item) => item.name === TEST_COMPOSITION_NAME
    );

    if (!testComposition) {
      throw new Error("Test composition not found in results");
    }

    testComposition.id = BLANK_UUID;

    // Verify just the test composition
    expect(testComposition).toMatchSnapshot();
  });
});
