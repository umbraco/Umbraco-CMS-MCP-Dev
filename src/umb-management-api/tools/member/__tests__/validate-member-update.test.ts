import ValidateMemberUpdateTool from "../put/validate-member-update.js";
import { MemberBuilder } from "./helpers/member-builder.js";
import { MemberTestHelper } from "./helpers/member-test-helper.js";
import { jest } from "@jest/globals";
import { normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";
import { Default_Memeber_TYPE_ID } from "../../../../constants/constants.js";

const TEST_MEMBER_NAME = "_Test Member Update Validation";
const TEST_MEMBER_EMAIL = "_test_member_update_validation@example.com";

// Helper to build a basic validation model for updates
function buildUpdateValidationModel(id: string, username: string) {
  return {
    id: id,
    email: TEST_MEMBER_EMAIL,
    username: username,
    isApproved: true,
    isLockedOut: false,
    isTwoFactorEnabled: false,
    memberType: { id: Default_Memeber_TYPE_ID },
    values: [],
    variants: [
      {
        name: TEST_MEMBER_NAME,
        culture: null,
        segment: null,
      },
    ],
  };
}

describe("validate-member-update", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    // Clean up any test members
    await MemberTestHelper.cleanup(TEST_MEMBER_EMAIL);
    await MemberTestHelper.cleanup("invalid_test@example.com");
  });

  it("should validate a member update with valid data", async () => {
    // Arrange - create an actual member to validate updates for
    const memberBuilder = await new MemberBuilder()
      .withName(TEST_MEMBER_NAME)
      .withEmail(TEST_MEMBER_EMAIL)
      .withUsername(TEST_MEMBER_EMAIL)
      .withPassword("test123@Longer")
      .withMemberType(Default_Memeber_TYPE_ID)
      .create();

    const memberId = memberBuilder.getId();
    // Use the same username as the created member, and include the id in the payload
    const model = buildUpdateValidationModel(memberId, TEST_MEMBER_EMAIL);

    // Act - validate the update for the existing member
    const result = await ValidateMemberUpdateTool.handler({
      id: memberId,
      data: model
    }, { signal: new AbortController().signal });

    // Assert - verify the handler response using snapshot
    expect(result).toMatchSnapshot();
  });

  it("should handle validation errors for invalid update data", async () => {
    // Arrange - create an actual member to validate updates for
    const memberBuilder = await new MemberBuilder()
      .withName(TEST_MEMBER_NAME + "_Invalid")
      .withEmail("invalid_test@example.com")
      .withUsername("invalid_test@example.com")
      .withPassword("test123@Longer")
      .withMemberType(Default_Memeber_TYPE_ID)
      .create();

    // Invalid model: required fields are missing or invalid
    const invalidModel = {
      values: [],
      variants: [{ name: "", culture: null, segment: null }],
      email: "invalid-email-format",
      username: "",
      isApproved: true,
      isLockedOut: false,
      isTwoFactorEnabled: false,
    };

    // Act - validate invalid update data
    const result = await ValidateMemberUpdateTool.handler({
      id: memberBuilder.getId(),
      data: invalidModel
    }, { signal: new AbortController().signal });

    // Assert - verify the error response using snapshot
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });

  it("should handle validation for non-existent member", async () => {
    const nonExistentId = crypto.randomUUID();
    const model = buildUpdateValidationModel(nonExistentId, TEST_MEMBER_EMAIL);

    const result = await ValidateMemberUpdateTool.handler({
      id: nonExistentId,
      data: model
    }, { signal: new AbortController().signal });

    // Assert - verify the error response using snapshot
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });
});