import GetMemberGroupRootTool from "../get/get-root.js";
import { MemberGroupBuilder } from "./helpers/member-group-builder.js";
import { MemberGroupTestHelper } from "./helpers/member-group-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_GROUP_NAME_1 = "_Test Member Group Root 1";
const TEST_GROUP_NAME_2 = "_Test Member Group Root 2";

describe("get-member-group-root", () => {
  setupTestEnvironment();

  let builder1: MemberGroupBuilder;
  let builder2: MemberGroupBuilder;

  beforeEach(async () => {
    builder1 = new MemberGroupBuilder();
    builder2 = new MemberGroupBuilder();
    await builder1.withName(TEST_GROUP_NAME_1).create();
    await builder2.withName(TEST_GROUP_NAME_2).create();
  });

  afterEach(async () => {
    await MemberGroupTestHelper.cleanup(TEST_GROUP_NAME_1);
    await MemberGroupTestHelper.cleanup(TEST_GROUP_NAME_2);
  });

  it("should get the root of the member group tree and include created groups", async () => {
    const result = await GetMemberGroupRootTool.handler(
      { skip: undefined, take: 100 },
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's output schema
    const data = validateToolResponse(GetMemberGroupRootTool, result);
    const names = data.items ? data.items.map((item: any) => item.name) : [];
    expect(names).toEqual(expect.arrayContaining([TEST_GROUP_NAME_1, TEST_GROUP_NAME_2]));
  });
}); 