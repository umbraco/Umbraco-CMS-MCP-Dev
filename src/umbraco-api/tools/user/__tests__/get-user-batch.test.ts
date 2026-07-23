import GetUserBatchTool from "../get/get-user-batch.js";
import { UserBuilder } from "./helpers/user-builder.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_USER_NAME = "_Test User Batch A";
const TEST_USER_EMAIL = `test-user-batch-a-${Math.floor(Math.random() * 10000)}@example.com`;
const TEST_USER_NAME_2 = "_Test User Batch B";
const TEST_USER_EMAIL_2 = `test-user-batch-b-${Math.floor(Math.random() * 10000)}@example.com`;

describe("get-user-batch", () => {
  setupTestEnvironment();

  let userBuilder1: UserBuilder;
  let userBuilder2: UserBuilder;

  afterEach(async () => {
    if (userBuilder1) {
      await userBuilder1.cleanup();
      userBuilder1 = undefined!;
    }
    if (userBuilder2) {
      await userBuilder2.cleanup();
      userBuilder2 = undefined!;
    }
  });

  it("should get multiple users in a single request", async () => {
    // Arrange
    userBuilder1 = new UserBuilder()
      .withName(TEST_USER_NAME)
      .withUserName(TEST_USER_EMAIL)
      .withEmail(TEST_USER_EMAIL);
    await userBuilder1.create();

    userBuilder2 = new UserBuilder()
      .withName(TEST_USER_NAME_2)
      .withUserName(TEST_USER_EMAIL_2)
      .withEmail(TEST_USER_EMAIL_2);
    await userBuilder2.create();

    // Act
    const result = await GetUserBatchTool.handler(
      { id: [userBuilder1.getId(), userBuilder2.getId()] },
      createMockRequestHandlerExtra()
    );

    // Assert
    const data = validateToolResponse(GetUserBatchTool, result);
    expect(data.total).toBe(2);
    expect(data.items).toHaveLength(2);
    const ids = data.items.map((i: any) => i.id).sort();
    expect(ids).toEqual([userBuilder1.getId(), userBuilder2.getId()].sort());

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});
