import ValidateMemberTool from "../post/validate-member.js";
import { MemberTestHelper } from "./helpers/member-test-helper.js";
import { jest } from "@jest/globals";
import { normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";

const TEST_MEMBER_NAME = "_Test Member Validation";
const TEST_MEMBER_EMAIL = "_test_member_validation@example.com";

// Helper to build a basic validation model
function buildValidationModel() {
  return {
    values: [],
    variants: [
      {
        name: TEST_MEMBER_NAME,
        culture: null,
        segment: null,
      },
    ],
    memberType: { id: "d59be02f-1df9-4228-aa1e-01917d806cda" }, // Default member type
    email: TEST_MEMBER_EMAIL,
    username: TEST_MEMBER_NAME,
    password: "TestPassword123!",
    isApproved: true,
  };
}

describe("validate-member", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    // Clean up any test members that might have been created
    await MemberTestHelper.cleanup(TEST_MEMBER_NAME);
  });

  it("should validate a member successfully", async () => {
    const model = buildValidationModel();
    const result = await ValidateMemberTool().handler(model, {
      signal: new AbortController().signal,
    });
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
    const result = await ValidateMemberTool().handler(invalidModel as any, {
      signal: new AbortController().signal,
    });
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });
});