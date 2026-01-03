import { getMemberGroupByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import GetMemberGroupTool from "../get/get-member-group.js";
import { MemberGroupBuilder } from "./helpers/member-group-builder.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_GROUP_NAME = "_Test Member Group Get";

describe("get-member-group", () => {
  setupTestEnvironment();

  let builder: MemberGroupBuilder;

  beforeEach(() => {
    builder = new MemberGroupBuilder();
  });

  afterEach(async () => {
    await builder.cleanup();
  });

  it("should get a member group by id", async () => {
    await builder.withName(TEST_GROUP_NAME).create();
    const params = getMemberGroupByIdParams.parse({ id: builder.getId() });
    const result = await GetMemberGroupTool.handler(
      params,
      createMockRequestHandlerExtra()
    );
    expect(createSnapshotResult(result, builder.getId())).toMatchSnapshot();
  });

  it("should handle non-existent member group", async () => {
    const params = getMemberGroupByIdParams.parse({ id: BLANK_UUID });
    const result = await GetMemberGroupTool.handler(
      params,
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
  });
});
