import GetUserByIdCalculateStartNodesTool from "../get/get-user-by-id-calculate-start-nodes.js";
import { UserBuilder } from "./helpers/user-builder.js";
import { createSnapshotResult, normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { getUserByIdCalculateStartNodesParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const TEST_USER_NAME = "_Test User Start Nodes";
const TEST_USER_EMAIL = `test-user-start-nodes-${Math.floor(Math.random() * 10000)}@example.com`;

describe("get-user-by-id-calculate-start-nodes", () => {
  setupTestEnvironment();
  let userBuilder: UserBuilder;

  afterEach(async () => {
    if (userBuilder) {
      await userBuilder.cleanup();
      userBuilder = undefined!;
    }
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
    const params = getUserByIdCalculateStartNodesParams.parse({ id: userId });
    const result = await GetUserByIdCalculateStartNodesTool.handler(params, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result, userId);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle non-existent user ID", async () => {
    // Act
    const params = getUserByIdCalculateStartNodesParams.parse({
      id: "00000000-0000-0000-0000-000000000000"
    });
    const result = await GetUserByIdCalculateStartNodesTool.handler(params, createMockRequestHandlerExtra());

    // Assert
    expect(result.isError).toBe(true);
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
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
    const params = getUserByIdCalculateStartNodesParams.parse({ id: userId });
    const result1 = await GetUserByIdCalculateStartNodesTool.handler(params, createMockRequestHandlerExtra());
    const result2 = await GetUserByIdCalculateStartNodesTool.handler(params, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult1 = createSnapshotResult(result1, userId);
    const normalizedResult2 = createSnapshotResult(result2, userId);

    expect(normalizedResult1).toEqual(normalizedResult2);
  });
});
