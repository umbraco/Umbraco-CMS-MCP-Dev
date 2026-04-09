import SearchMemberTypeItemsTool from "../get/get-item-member-type-search.js";
import { MemberTypeBuilder } from "./helpers/member-type-builder.js";
import { MemberTypeTestHelper } from "./helpers/member-type-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { withCursorPagination } from "@umbraco-cms/mcp-server-sdk";

const TEST_MEMBER_TYPE_NAME = "_Test Item MemberType Search";
const TEST_MEMBER_TYPE_NAME_2 = "_Test Item MemberType Search 2";

describe("search-member-type-items", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await MemberTypeTestHelper.cleanup(TEST_MEMBER_TYPE_NAME);
    await MemberTypeTestHelper.cleanup(TEST_MEMBER_TYPE_NAME_2);
  });

  it("should search for member type items", async () => {
    // Arrange - Create a test member type
    await new MemberTypeBuilder()
      .withName(TEST_MEMBER_TYPE_NAME)
      .create();

    // Act - Search for the member type
    const cursorTool = withCursorPagination(SearchMemberTypeItemsTool);
    const result = await cursorTool.handler(
      { query: TEST_MEMBER_TYPE_NAME },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify results contain our member type
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should return empty results for non-existent search query", async () => {
    // Act - Search for a member type that doesn't exist
    const cursorTool = withCursorPagination(SearchMemberTypeItemsTool);
    const result = await cursorTool.handler(
      { query: "nonexistent_member_type_" + Date.now() },
      createMockRequestHandlerExtra()
    );

    // Assert - Validate response against tool's output schema
    const data = validateToolResponse(cursorTool, result);
    expect(data.total).toBe(0);
    expect(data.items).toEqual([]);
  });
});
