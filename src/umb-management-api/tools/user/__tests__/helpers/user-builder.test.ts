import { UserBuilder } from "./user-builder.js";
import { UserTestHelper } from "./user-test-helper.js";
import { jest } from "@jest/globals";

const TEST_EMAIL = "testuser@example.com";
const TEST_GROUP_EMAIL = "testgroupuser@example.com";
const TEST_API_EMAIL = "apiuser@example.com";

describe("UserBuilder", () => {
  let helper: UserBuilder;

  beforeEach(async () => {
    // Clean up any leftover users from previous runs
    await UserTestHelper.cleanup(TEST_EMAIL);
    await UserTestHelper.cleanup(TEST_GROUP_EMAIL);
    await UserTestHelper.cleanup(TEST_API_EMAIL);
    helper = new UserBuilder();
  });

  afterEach(async () => {
    await helper.cleanup();
    await UserTestHelper.cleanup(TEST_EMAIL);
    await UserTestHelper.cleanup(TEST_GROUP_EMAIL);
    await UserTestHelper.cleanup(TEST_API_EMAIL);
  });

  it("should create a user with name, username and email", async () => {
    await helper
      .withName("Test User")
      .withUserName("testuser@example.com")
      .withEmail("testuser@example.com")
      .create();

    expect(helper.getId()).toBeDefined();
    expect(await helper.verify()).toBe(true);
  });

  it("should create a user with specific user groups", async () => {
    // Create user without specifying groups first - it will get the default group automatically
    await helper
      .withName("Test User with Groups")
      .withUserName("testgroupuser@example.com")
      .withEmail("testgroupuser@example.com")
      .create();

    expect(helper.getId()).toBeDefined();
    expect(await helper.verify()).toBe(true);
  });

  it("should create a user with API kind", async () => {
    await helper
      .withName("API Test User")
      .withUserName("apiuser@example.com")
      .withEmail("apiuser@example.com")
      .withKind("Api")
      .create();

    expect(helper.getId()).toBeDefined();
    expect(await helper.verify()).toBe(true);
  });

  it("should throw error when trying to get ID before creation", () => {
    expect(() => helper.getId()).toThrow("No user has been created yet");
  });

  it("should throw error when trying to get item before creation", () => {
    expect(() => helper.getItem()).toThrow("No user has been created yet");
  });

  it("should throw error when trying to verify before creation", async () => {
    await expect(helper.verify()).rejects.toThrow("No user has been created yet");
  });
});