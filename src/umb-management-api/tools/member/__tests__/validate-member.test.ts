import ValidateMemberTool from "../post/validate-member.js";
import { MemberTestHelper } from "./helpers/member-test-helper.js";
import { normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_MEMBER_NAME = "_Test Member Validation";
const TEST_MEMBER_EMAIL = "_test_member_validation@example.com";

// Helper to build a basic validation model
function buildValidationModel() {
  return {
    id: undefined,
    email: TEST_MEMBER_EMAIL,
    username: TEST_MEMBER_EMAIL,
    password: "TestPassword123!",
    isApproved: true,
    memberType: { id: "d59be02f-1df9-4228-aa1e-01917d806cda" }, // Default member type
    groups: [],
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

describe("validate-member", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any test members that might have been created
    await MemberTestHelper.cleanup(TEST_MEMBER_NAME);
  });

  it("should validate a member successfully", async () => {
    const model = buildValidationModel();
    const result = await ValidateMemberTool.handler(
      model,
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
  });

  it("should handle validation errors for invalid member data", async () => {
    // Invalid model: required fields are missing or invalid
    const invalidModel = {
      values: [],
      variants: [{ name: "", culture: null, segment: null }],
      memberType: undefined,
      email: "invalid-email",
      username: "",
    };
    const result = await ValidateMemberTool.handler(
      invalidModel as any,
      createMockRequestHandlerExtra()
    );
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });
});