import { MemberTypeTestHelper } from "./helpers/member-type-helper.js";
import DeleteMemberTypeTool from "../delete/delete-member-type.js";
import { MemberTypeBuilder } from "./helpers/member-type-builder.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("delete-member-type", () => {
  setupTestEnvironment();

  const TEST_MEMBER_TYPE_NAME = "_Test Member Type";

  afterEach(async () => {
    await MemberTypeTestHelper.cleanup(TEST_MEMBER_TYPE_NAME);
  });

  it("should delete a member type", async () => {
    // Create a member type first
    const builder = await new MemberTypeBuilder()
      .withName(TEST_MEMBER_TYPE_NAME)
      .withDescription("Test member type description")
      .withAllowedAsRoot(true)
      .create();

    const result = await DeleteMemberTypeTool.handler(
      {
        id: builder.getId(),
      },
      createMockRequestHandlerExtra()
    );

    // Normalize and verify response
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();

    // Verify the member type was deleted
    const items = await MemberTypeTestHelper.findMemberTypes(
      TEST_MEMBER_TYPE_NAME
    );
    expect(items.length).toBe(0);
  });

  it("should handle non-existent member type", async () => {
    const result = await DeleteMemberTypeTool.handler(
      {
        id: BLANK_UUID,
      },
      createMockRequestHandlerExtra()
    );

    expect(result).toMatchSnapshot();
  });
});
