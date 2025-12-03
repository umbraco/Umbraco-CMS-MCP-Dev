import SearchMemberTypeItemsTool from "../get/get-item-member-type-search.js";
import { MemberTypeBuilder } from "./helpers/member-type-builder.js";
import { MemberTypeTestHelper } from "./helpers/member-type-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const TEST_MEMBER_TYPE_NAME = "_Test Item MemberType Search";
const TEST_MEMBER_TYPE_NAME_2 = "_Test Item MemberType Search 2";

describe("search-member-type-items", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await MemberTypeTestHelper.cleanup(TEST_MEMBER_TYPE_NAME);
    await MemberTypeTestHelper.cleanup(TEST_MEMBER_TYPE_NAME_2);
    console.error = originalConsoleError;
  });

  it("should search for member type items", async () => {
    // Arrange - Create a test member type
    await new MemberTypeBuilder()
      .withName(TEST_MEMBER_TYPE_NAME)
      .create();

    // Act - Search for the member type
    const result = await SearchMemberTypeItemsTool().handler(
      { query: TEST_MEMBER_TYPE_NAME, take: 100 },
      { signal: new AbortController().signal }
    );

    // Assert - Verify results contain our member type
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should return empty results for non-existent search query", async () => {
    // Act - Search for a member type that doesn't exist
    const result = await SearchMemberTypeItemsTool().handler(
      { query: "nonexistent_member_type_" + Date.now(), take: 100 },
      { signal: new AbortController().signal }
    );

    // Assert - Verify empty results
    const data = JSON.parse(result.content[0].text as string);
    expect(data.total).toBe(0);
    expect(data.items).toEqual([]);
  });
});
