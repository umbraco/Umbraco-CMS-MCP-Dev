import GetMemberTypeAncestorsBatchTool from "../items/get/get-ancestors-batch.js";
import { MemberTypeBuilder } from "./helpers/member-type-builder.js";
import { MemberTypeTestHelper } from "./helpers/member-type-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-member-type-ancestors-batch", () => {
  const TEST_MEMBERTYPE_NAME = "_Test AncestorsBatch MemberType";
  setupTestEnvironment();

  afterEach(async () => {
    await MemberTypeTestHelper.cleanup(TEST_MEMBERTYPE_NAME);
  });

  it("should return an ancestor entry per requested Id", async () => {
    const builder = await new MemberTypeBuilder()
      .withName(TEST_MEMBERTYPE_NAME)
      .create();

    const result = await GetMemberTypeAncestorsBatchTool.handler(
      { id: [builder.getId()] },
      createMockRequestHandlerExtra()
    );

    const data = validateToolResponse(GetMemberTypeAncestorsBatchTool, result);
    expect(data.items).toHaveLength(1);
    expect(Array.isArray(data.items[0].ancestors)).toBe(true);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
