import GetItemMemberSearchTool from "../get/get-item-member-search.js";
import { MemberBuilder } from "./helpers/member-builder.js";
import { MemberTestHelper } from "./helpers/member-test-helper.js";
import { Default_Memeber_TYPE_ID } from "../../../../constants/constants.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const TEST_MEMBER_NAME = "_Test Item Member Search";
const TEST_MEMBER_EMAIL = "itemsearch@example.com";
const TEST_MEMBER_USERNAME = "itemsearch@example.com";
const TEST_MEMBER_NAME_2 = "_Test Item Member Search 2";
const TEST_MEMBER_EMAIL_2 = "itemsearch2@example.com";
const TEST_MEMBER_USERNAME_2 = "itemsearch2@example.com";

describe("get-item-member-search", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await MemberTestHelper.cleanup(TEST_MEMBER_USERNAME);
    await MemberTestHelper.cleanup(TEST_MEMBER_USERNAME_2);
    console.error = originalConsoleError;
  });

  it("should search for member items", async () => {
    // Arrange - Create a test member
    await new MemberBuilder()
      .withName(TEST_MEMBER_NAME)
      .withEmail(TEST_MEMBER_EMAIL)
      .withUsername(TEST_MEMBER_USERNAME)
      .withPassword("test123@Longer")
      .withMemberType(Default_Memeber_TYPE_ID)
      .create();

    // Act - Search for the member
    const result = await GetItemMemberSearchTool().handler(
      { query: TEST_MEMBER_USERNAME, take: 100 },
      { signal: new AbortController().signal }
    );

    // Assert - Verify results contain our member
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should return empty results for non-existent search query", async () => {
    // Act - Search for a member that doesn't exist
    const result = await GetItemMemberSearchTool().handler(
      { query: "nonexistent_member_" + Date.now(), take: 100 },
      { signal: new AbortController().signal }
    );

    // Assert - Verify empty results
    const data = JSON.parse(result.content[0].text as string);
    expect(data.total).toBe(0);
    expect(data.items).toEqual([]);
  });

  it("should support pagination with skip and take", async () => {
    // Arrange - Create two test members
    await new MemberBuilder()
      .withName(TEST_MEMBER_NAME)
      .withEmail(TEST_MEMBER_EMAIL)
      .withUsername(TEST_MEMBER_USERNAME)
      .withPassword("test123@Longer")
      .withMemberType(Default_Memeber_TYPE_ID)
      .create();

    await new MemberBuilder()
      .withName(TEST_MEMBER_NAME_2)
      .withEmail(TEST_MEMBER_EMAIL_2)
      .withUsername(TEST_MEMBER_USERNAME_2)
      .withPassword("test123@Longer")
      .withMemberType(Default_Memeber_TYPE_ID)
      .create();

    // Act - Search with pagination (take only 1 result)
    const result = await GetItemMemberSearchTool().handler(
      { query: "itemsearch", skip: 0, take: 1 },
      { signal: new AbortController().signal }
    );

    // Assert - Verify only one item is returned
    const data = JSON.parse(result.content[0].text as string);
    expect(data.items.length).toBeLessThanOrEqual(1);
  });
});
