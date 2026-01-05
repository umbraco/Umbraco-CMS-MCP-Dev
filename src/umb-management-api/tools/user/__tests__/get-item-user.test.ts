import GetItemUserTool from "../get/get-item-user.js";
import { UserBuilder } from "./helpers/user-builder.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { getItemUserQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const TEST_USER_NAME = "_Test User Item";
const TEST_USER_EMAIL = `test-user-item-${Math.floor(Math.random() * 10000)}@example.com`;

describe("get-item-user", () => {
  setupTestEnvironment();
  let userBuilder: UserBuilder;

  afterEach(async () => {
    if (userBuilder) {
      await userBuilder.cleanup();
      userBuilder = undefined!;
    }
  });

  it("should get user items with default parameters", async () => {
    // Arrange
    userBuilder = new UserBuilder()
      .withName(TEST_USER_NAME)
      .withUserName(TEST_USER_EMAIL)
      .withEmail(TEST_USER_EMAIL);

    await userBuilder.create();

    // Act
    const params = getItemUserQueryParams.parse({});
    const result = await GetItemUserTool.handler(params as any, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify expected structure - tool returns { items: [...] }
    const items = (result.structuredContent as any).items;
    expect(Array.isArray(items)).toBe(true);

    // Should contain user items
    if (items.length > 0) {
      expect(items[0]).toHaveProperty("id");
      expect(items[0]).toHaveProperty("name");
      expect(typeof items[0].id).toBe("string");
      expect(typeof items[0].name).toBe("string");
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
    const params = getItemUserQueryParams.parse({
      id: [userId]
    });
    const result = await GetItemUserTool.handler(params as any, createMockRequestHandlerExtra());

    // Assert
    const items = (result.structuredContent as any).items;
    expect(Array.isArray(items)).toBe(true);

    // Should find the specific user
    const foundUser = items.find((user: any) => user.id === userId);
    expect(foundUser).toBeDefined();
    expect(foundUser.name).toBe(TEST_USER_NAME);
  });

  it("should return empty array for non-existent user IDs", async () => {
    // Act
    const params = getItemUserQueryParams.parse({
      id: ["00000000-0000-0000-0000-000000000000"]
    });
    const result = await GetItemUserTool.handler(params as any, createMockRequestHandlerExtra());

    // Assert
    const items = (result.structuredContent as any).items;
    expect(Array.isArray(items)).toBe(true);
    expect(items).toHaveLength(0);
  });
});
