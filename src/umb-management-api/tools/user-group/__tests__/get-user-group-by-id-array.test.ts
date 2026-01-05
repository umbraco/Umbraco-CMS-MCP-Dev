import GetUserGroupByIdArrayTool from "../get/get-user-group-by-id-array.js";
import { UserGroupBuilder } from "./helpers/user-group-builder.js";
import { UserGroupTestHelper } from "./helpers/user-group-helper.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("get-user-group-by-id-array", () => {
  const TEST_GROUP_NAME_1 = "_Test User Group 1";
  const TEST_GROUP_NAME_2 = "_Test User Group 2";

  setupTestEnvironment();

  afterEach(async () => {
    await UserGroupTestHelper.cleanup(TEST_GROUP_NAME_1);
    await UserGroupTestHelper.cleanup(TEST_GROUP_NAME_2);
  });

  it("should get single user group by ID", async () => {
    const builder = await new UserGroupBuilder()
      .withName(TEST_GROUP_NAME_1)
      .create();
    const result = await GetUserGroupByIdArrayTool.handler(
      { id: [builder.getId()] },
      createMockRequestHandlerExtra()
    );
    const items = (result.structuredContent as any)?.items ?? [];
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe(TEST_GROUP_NAME_1);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should get multiple user groups by ID", async () => {
    const builder1 = await new UserGroupBuilder()
      .withName(TEST_GROUP_NAME_1)
      .create();
    const builder2 = await new UserGroupBuilder()
      .withName(TEST_GROUP_NAME_2)
      .create();
    const result = await GetUserGroupByIdArrayTool.handler(
      { id: [builder1.getId(), builder2.getId()] },
      createMockRequestHandlerExtra()
    );
    const items = (result.structuredContent as any)?.items ?? [];
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe(TEST_GROUP_NAME_1);
    expect(items[1].name).toBe(TEST_GROUP_NAME_2);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
