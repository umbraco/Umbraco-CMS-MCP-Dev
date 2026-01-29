import GetUserByIdTool from "../get/get-user-by-id.js";
import { UserBuilder } from "./helpers/user-builder.js";
import { getUserByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  normalizeErrorResponse,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_USER_NAME = "_Test User Get By ID";
const TEST_USER_EMAIL = `test-user-get-${Math.floor(Math.random() * 10000)}@example.com`;

describe("get-user-by-id", () => {
  setupTestEnvironment();
  let userBuilder: UserBuilder;

  afterEach(async () => {
    if (userBuilder) {
      await userBuilder.cleanup();
      userBuilder = undefined!;
    }
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
    const params = getUserByIdParams.parse({ id: userId });
    const result = await GetUserByIdTool.handler(params, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result, userId);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle non-existent user id", async () => {
    // Act
    const params = getUserByIdParams.parse({ id: BLANK_UUID });
    const result = await GetUserByIdTool.handler(params, createMockRequestHandlerExtra());

    // Assert
    expect(result.isError).toBe(true);
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });
});
