import { UserTestHelper, DEFAULT_LANGUAGE_ISO_CODE } from "./user-test-helper.js";
import { UserBuilder } from "./user-builder.js";
import { jest } from "@jest/globals";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_USER_NAME = "_Test User Helper";
const TEST_USER_EMAIL = "testhelper@example.com";
const TEST_USER_USERNAME = TEST_USER_EMAIL;

describe("UserTestHelper", () => {
  let originalConsoleError: typeof console.error;
  let builder: UserBuilder;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    builder = new UserBuilder();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await builder.cleanup();
  });

  describe("verifyUser", () => {
    it("should verify an existing user", async () => {
      await builder
        .withName(TEST_USER_NAME)
        .withUserName(TEST_USER_USERNAME)
        .withEmail(TEST_USER_EMAIL)
        .create();

      const exists = await UserTestHelper.verifyUser(builder.getId());
      expect(exists).toBe(true);
    });

    it("should return false for non-existent user", async () => {
      const exists = await UserTestHelper.verifyUser(BLANK_UUID);
      expect(exists).toBe(false);
    });
  });

  describe("getUser", () => {
    it("should get user by id", async () => {
      await builder
        .withName(TEST_USER_NAME)
        .withUserName(TEST_USER_USERNAME)
        .withEmail(TEST_USER_EMAIL)
        .create();

      const user = await UserTestHelper.getUser(builder.getId());
      expect(user).toBeDefined();
      expect(user.name).toBe(TEST_USER_NAME);
      expect(user.userName).toBe(TEST_USER_USERNAME);
      expect(user.email).toBe(TEST_USER_EMAIL);
    });

    it("should throw for non-existent user", async () => {
      await expect(UserTestHelper.getUser(BLANK_UUID)).rejects.toThrow();
    });
  });

  describe("findUsers", () => {
    it("should find users by email", async () => {
      await builder
        .withName(TEST_USER_NAME)
        .withUserName(TEST_USER_USERNAME)
        .withEmail(TEST_USER_EMAIL)
        .create();

      const users = await UserTestHelper.findUsers(TEST_USER_EMAIL);
      expect(users.length).toBeGreaterThan(0);
      const foundUser = users.find((u: any) => u.email === TEST_USER_EMAIL);
      expect(foundUser).toBeDefined();
      expect(foundUser?.name).toBe(TEST_USER_NAME);
    });

    it("should find users with blank UUID for snapshot", async () => {
      await builder
        .withName(TEST_USER_NAME)
        .withUserName(TEST_USER_USERNAME)
        .withEmail(TEST_USER_EMAIL)
        .create();

      const users = await UserTestHelper.findUsers(TEST_USER_EMAIL, true);
      expect(users.length).toBeGreaterThan(0);
      const foundUser = users.find((u: any) => u.email === TEST_USER_EMAIL);
      expect(foundUser?.id).toBe(BLANK_UUID);
    });

    it("should return all users when no email specified", async () => {
      const users = await UserTestHelper.findUsers();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
    });
  });
});