import FindUserTool from "../get/find-user.js";
import { UserBuilder } from "./helpers/user-builder.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const TEST_USER_NAME = "_Test User Find";
const TEST_USER_EMAIL = `test-user-find-${Math.floor(Math.random() * 10000)}@example.com`;

describe("find-user", () => {
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

  it("should find user by name", async () => {
    // Arrange
    userBuilder = new UserBuilder()
      .withName(TEST_USER_NAME)
      .withUserName(TEST_USER_EMAIL)
      .withEmail(TEST_USER_EMAIL);

    await userBuilder.create();

    // Act
    const result = await FindUserTool.handler({
      filter: TEST_USER_NAME,
      skip: 0,
      take: 10
    }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify expected structure
    const parsed = JSON.parse(result.content[0].text as string);
    expect(parsed).toHaveProperty("items");
    expect(parsed).toHaveProperty("total");
    expect(Array.isArray(parsed.items)).toBe(true);

    // Should find our created user
    const foundUser = parsed.items.find((user: any) => user.name === TEST_USER_NAME);
    expect(foundUser).toBeDefined();
  });

  it("should return empty results for non-existent user", async () => {
    // Act
    const result = await FindUserTool.handler({
      filter: "NonExistentUser123",
      skip: 0,
      take: 10
    }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});