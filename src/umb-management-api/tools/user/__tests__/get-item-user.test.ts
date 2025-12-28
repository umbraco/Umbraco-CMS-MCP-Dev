import GetItemUserTool from "../get/get-item-user.js";
import { UserBuilder } from "./helpers/user-builder.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const TEST_USER_NAME = "_Test User Item";
const TEST_USER_EMAIL = `test-user-item-${Math.floor(Math.random() * 10000)}@example.com`;

describe("get-item-user", () => {
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

  it("should get user items with default parameters", async () => {
    // Arrange
    userBuilder = new UserBuilder()
      .withName(TEST_USER_NAME)
      .withUserName(TEST_USER_EMAIL)
      .withEmail(TEST_USER_EMAIL);

    await userBuilder.create();

    // Act
    const result = await GetItemUserTool.handler({
    }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify expected structure
    const parsed = JSON.parse(result.content[0].text as string);
    expect(Array.isArray(parsed)).toBe(true);

    // Should contain user items
    if (parsed.length > 0) {
      expect(parsed[0]).toHaveProperty("id");
      expect(parsed[0]).toHaveProperty("name");
      expect(typeof parsed[0].id).toBe("string");
      expect(typeof parsed[0].name).toBe("string");
    }
  });

  it("should filter user items by IDs", async () => {
    // Arrange
    userBuilder = new UserBuilder()
      .withName(TEST_USER_NAME)
      .withUserName(TEST_USER_EMAIL)
      .withEmail(TEST_USER_EMAIL);

    await userBuilder.create();
    const userId = userBuilder.getId();

    // Act
    const result = await GetItemUserTool.handler({
      id: [userId]
    }, { signal: new AbortController().signal });

    // Assert
    const parsed = JSON.parse(result.content[0].text as string);
    expect(Array.isArray(parsed)).toBe(true);

    // Should find the specific user
    const foundUser = parsed.find((user: any) => user.id === userId);
    expect(foundUser).toBeDefined();
    expect(foundUser.name).toBe(TEST_USER_NAME);
  });

  it("should return empty array for non-existent user IDs", async () => {
    // Act
    const result = await GetItemUserTool.handler({
      id: ["00000000-0000-0000-0000-000000000000"]
    }, { signal: new AbortController().signal });

    // Assert
    const parsed = JSON.parse(result.content[0].text as string);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(0);
  });
});