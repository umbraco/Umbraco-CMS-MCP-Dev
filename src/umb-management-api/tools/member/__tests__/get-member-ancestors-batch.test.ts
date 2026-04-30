import GetMemberAncestorsBatchTool from "../get/get-member-ancestors-batch.js";
import { MemberBuilder } from "./helpers/member-builder.js";
import { MemberTestHelper } from "./helpers/member-test-helper.js";
import { Default_Memeber_TYPE_ID } from "@/constants/constants.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-member-ancestors-batch", () => {
  const TEST_MEMBER_NAME = "_Test AncestorsBatch Member";
  const TEST_MEMBER_USERNAME = "ancestorsbatch@example.com";
  setupTestEnvironment();

  beforeEach(async () => {
    await MemberTestHelper.cleanup(TEST_MEMBER_USERNAME);
  });

  afterEach(async () => {
    await MemberTestHelper.cleanup(TEST_MEMBER_USERNAME);
  });

  it("should return an entry per requested member Id", async () => {
    const builder = await new MemberBuilder()
      .withName(TEST_MEMBER_NAME)
      .withEmail(TEST_MEMBER_USERNAME)
      .withUsername(TEST_MEMBER_USERNAME)
      .withPassword("Password123!")
      .withMemberType(Default_Memeber_TYPE_ID)
      .create();

    const result = await GetMemberAncestorsBatchTool.handler(
      { id: [builder.getId()] },
      createMockRequestHandlerExtra()
    );

    const data = validateToolResponse(GetMemberAncestorsBatchTool, result);
    expect(data.items).toHaveLength(1);
    expect(Array.isArray(data.items[0].ancestors)).toBe(true);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
