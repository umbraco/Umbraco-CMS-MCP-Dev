import FindUserTool from "../get/find-user.js";
import { UserBuilder } from "./helpers/user-builder.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { getFilterUserQueryParams, getFilterUserResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const TEST_USER_NAME = "_Test User Find";
const TEST_USER_EMAIL = `test-user-find-${Math.floor(Math.random() * 10000)}@example.com`;

describe("find-user", () => {
  setupTestEnvironment();
  let userBuilder: UserBuilder;

  afterEach(async () => {
    if (userBuilder) {
      await userBuilder.cleanup();
      userBuilder = undefined!;
    }
  });

  it("should find user by name", async () => {
    // Arrange
    userBuilder = new UserBuilder()
      .withName(TEST_USER_NAME)
      .withUserName(TEST_USER_EMAIL)
      .withEmail(TEST_USER_EMAIL);

    await userBuilder.create();

    // Act
    const params = getFilterUserQueryParams.parse({
      filter: TEST_USER_NAME,
      skip: 0,
      take: 10
    });
    const result = await FindUserTool.handler(params as any, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify expected structure
    const parsed = validateStructuredContent(result, getFilterUserResponse);
    expect(parsed).toHaveProperty("items");
    expect(parsed).toHaveProperty("total");
    expect(Array.isArray(parsed.items)).toBe(true);

    // Should find our created user
    const foundUser = parsed.items.find((user: any) => user.name === TEST_USER_NAME);
    expect(foundUser).toBeDefined();
  });

  it("should return empty results for non-existent user", async () => {
    // Act
    const params = getFilterUserQueryParams.parse({
      filter: "NonExistentUser123",
      skip: 0,
      take: 10
    });
    const result = await FindUserTool.handler(params as any, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});
