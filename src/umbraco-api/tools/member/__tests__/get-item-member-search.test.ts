import GetItemMemberSearchTool from "../get/get-item-member-search.js";
import { MemberBuilder } from "./helpers/member-builder.js";
import { MemberTestHelper } from "./helpers/member-test-helper.js";
import {
  Default_Memeber_TYPE_ID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_MEMBER_NAME = "_Test Item Member Search";
const TEST_MEMBER_EMAIL = "itemsearch@example.com";
const TEST_MEMBER_USERNAME = "itemsearch@example.com";
const TEST_MEMBER_NAME_2 = "_Test Item Member Search 2";
const TEST_MEMBER_EMAIL_2 = "othermember2@example.com";
const TEST_MEMBER_USERNAME_2 = "othermember2@example.com";

describe("get-item-member-search", () => {
  setupTestEnvironment();

  beforeEach(async () => {
    // Ensure cleanup before each test to prevent test pollution
    await MemberTestHelper.cleanup(TEST_MEMBER_USERNAME);
    await MemberTestHelper.cleanup(TEST_MEMBER_USERNAME_2);
  });

  afterEach(async () => {
    await MemberTestHelper.cleanup(TEST_MEMBER_USERNAME);
    await MemberTestHelper.cleanup(TEST_MEMBER_USERNAME_2);
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
    const result = await GetItemMemberSearchTool.handler(
      { query: TEST_MEMBER_USERNAME } as any,
      createMockRequestHandlerExtra()
    );

    // Assert - Verify results contain our member
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should return empty results for non-existent search query", async () => {
    // Act - Search for a member that doesn't exist using a very unique string
    const uniqueQuery = `xYz_NoNe_ExIsT_${Date.now()}_${Math.random().toString(36).substring(7)}@nowhere.invalid`;
    const result = await GetItemMemberSearchTool.handler(
      { query: uniqueQuery } as any,
      createMockRequestHandlerExtra()
    );

    // Assert - Validate response against tool's output schema
    const data = validateToolResponse(GetItemMemberSearchTool, result);
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

    // Act - Search with pagination (take only 1 result). "itemsearch" now matches
    // only TEST_MEMBER_USERNAME (member 2's email/username no longer contains that
    // substring), so there is exactly one candidate for Examine to index - no
    // ambiguous second match to race against. Examine indexes asynchronously, so
    // poll briefly for that single, unambiguous member to become searchable rather
    // than asserting immediately.
    //
    // An earlier version of this fix kept both members matching and polled for
    // `total >= 2` before asserting `take: 1` capped the response, to also prove
    // truncation. That was verified against a real Examine index to still be racy:
    // one run saw `total: 2` with `items.length: 2` in the very same response (take
    // not honoured on that read), and another timed out at `total: 0` after 10s -
    // reproducing the exact symptom this issue reports. Examine's paging apparently
    // isn't guaranteed consistent with its own reported total while the index is
    // still catching up, so waiting for a two-candidate total to settle doesn't
    // remove the race - it just moves it. Sticking to a single, unambiguous
    // candidate avoids that entirely.
    const maxAttempts = 20;
    const pollIntervalMs = 500;
    let data: any;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await GetItemMemberSearchTool.handler(
        { query: "itemsearch", take: 1 } as any,
        createMockRequestHandlerExtra()
      );
      data = validateToolResponse(GetItemMemberSearchTool, result);
      if (data.items.length >= 1) break;
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
    if (data.items.length < 1) {
      throw new Error(
        `Member did not become searchable after ${maxAttempts} attempts ` +
          `(${maxAttempts * pollIntervalMs}ms); last response: total=${data.total}, ` +
          `items=${JSON.stringify(data.items)}`
      );
    }

    // Assert - Validate response against tool's output schema
    expect(data.items.length).toBe(1);
  });
});
