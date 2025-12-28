import GetUserByIdTool from "../get/get-user-by-id.js";
import { UserBuilder } from "./helpers/user-builder.js";
import { createSnapshotResult, normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { jest } from "@jest/globals";

const TEST_USER_NAME = "_Test User Get By ID";
const TEST_USER_EMAIL = `test-user-get-${Math.floor(Math.random() * 10000)}@example.com`;

describe("get-user-by-id", () => {
  let originalConsoleError: typeof console.error;
  let userBuilder: UserBuilder;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    if (userBuilder) {
      await userBuilder.cleanup();
    }
    console.error = originalConsoleError;
  });

  it("should get user by id", async () => {
    // Arrange
    userBuilder = new UserBuilder()
      .withName(TEST_USER_NAME)
      .withUserName(TEST_USER_EMAIL)
      .withEmail(TEST_USER_EMAIL);

    await userBuilder.create();
    const userId = userBuilder.getId();

    // Act
    const result = await GetUserByIdTool.handler({ id: userId }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result, userId);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle non-existent user id", async () => {
    // Act
    const result = await GetUserByIdTool.handler({ id: BLANK_UUID }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = normalizeErrorResponse(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});