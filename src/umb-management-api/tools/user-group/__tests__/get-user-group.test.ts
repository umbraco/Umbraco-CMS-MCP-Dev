import { getUserGroupByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import GetUserGroupTool from "../get/get-user-group.js";
import { UserGroupBuilder } from "./helpers/user-group-builder.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_GROUP_NAME = "_Test User Group Get";

describe("get-user-group", () => {
  setupTestEnvironment();
  let builder: UserGroupBuilder;

  beforeEach(() => {
    builder = new UserGroupBuilder();
  });

  afterEach(async () => {
    await builder.cleanup();
  });

  it("should get a user group by id", async () => {
    await builder.withName(TEST_GROUP_NAME).create();
    const params = getUserGroupByIdParams.parse({ id: builder.getId() });
    const result = await GetUserGroupTool.handler(params, createMockRequestHandlerExtra());
    const data = validateToolResponse(GetUserGroupTool, result);
    expect(data.name).toBe(TEST_GROUP_NAME);
    expect(createSnapshotResult(result, builder.getId())).toMatchSnapshot();
  });

  it("should handle non-existent user group", async () => {
    const params = getUserGroupByIdParams.parse({ id: BLANK_UUID });
    const result = await GetUserGroupTool.handler(params, createMockRequestHandlerExtra());
    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
