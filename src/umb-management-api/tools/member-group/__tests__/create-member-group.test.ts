import CreateMemberGroupTool from "../post/create-member-group.js";
import { MemberGroupTestHelper } from "./helpers/member-group-helper.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

const TEST_GROUP_NAME = "_Test Member Group Created";
const EXISTING_GROUP_NAME = "_Existing Member Group";

describe("create-member-group", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await MemberGroupTestHelper.cleanup(TEST_GROUP_NAME);
    await MemberGroupTestHelper.cleanup(EXISTING_GROUP_NAME);
  });

  it("should create a member group", async () => {
    const result = await CreateMemberGroupTool.handler(
      { name: TEST_GROUP_NAME, id: undefined },
      createMockRequestHandlerExtra()
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();

    const items = await MemberGroupTestHelper.findMemberGroups(TEST_GROUP_NAME);
    expect(items).toEqual([{
      id: expect.any(String),
      name: TEST_GROUP_NAME
    }]);
  });

  it("should handle existing member group", async () => {
    // First create the group
    await CreateMemberGroupTool.handler(
      { name: EXISTING_GROUP_NAME, id: undefined },
      createMockRequestHandlerExtra()
    );

    // Try to create it again
    const result = await CreateMemberGroupTool.handler(
      { name: EXISTING_GROUP_NAME, id: undefined },
      createMockRequestHandlerExtra()
    );

    expect(result).toMatchSnapshot();
  });
});
