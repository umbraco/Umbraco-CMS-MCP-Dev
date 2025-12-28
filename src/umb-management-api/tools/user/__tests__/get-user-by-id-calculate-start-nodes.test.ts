import GetUserByIdCalculateStartNodesTool from "../get/get-user-by-id-calculate-start-nodes.js";
import { UserBuilder } from "./helpers/user-builder.js";
import { createSnapshotResult, normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const TEST_USER_NAME = "_Test User Start Nodes";
const TEST_USER_EMAIL = `test-user-start-nodes-${Math.floor(Math.random() * 10000)}@example.com`;

describe("get-user-by-id-calculate-start-nodes", () => {
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

  it("should calculate start nodes for a user", async () => {
    // Arrange
    userBuilder = new UserBuilder()
      .withName(TEST_USER_NAME)
      .withUserName(TEST_USER_EMAIL)
      .withEmail(TEST_USER_EMAIL);

    await userBuilder.create();
    const userId = userBuilder.getId();

    // Act
    const result = await GetUserByIdCalculateStartNodesTool.handler({
      id: userId
    }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result, userId);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle non-existent user ID", async () => {
    // Act
    const result = await GetUserByIdCalculateStartNodesTool.handler({
      id: "00000000-0000-0000-0000-000000000000"
    }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = normalizeErrorResponse(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should return consistent start nodes on multiple calls", async () => {
    // Arrange
    userBuilder = new UserBuilder()
      .withName(TEST_USER_NAME)
      .withUserName(TEST_USER_EMAIL)
      .withEmail(TEST_USER_EMAIL);

    await userBuilder.create();
    const userId = userBuilder.getId();

    // Act
    const result1 = await GetUserByIdCalculateStartNodesTool.handler({
      id: userId
    }, { signal: new AbortController().signal });
    const result2 = await GetUserByIdCalculateStartNodesTool.handler({
      id: userId
    }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult1 = createSnapshotResult(result1, userId);
    const normalizedResult2 = createSnapshotResult(result2, userId);

    expect(normalizedResult1).toEqual(normalizedResult2);
  });
});