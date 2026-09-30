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
const TEST_MEMBER_EMAIL_2 = "itemsearch2@example.com";
const TEST_MEMBER_USERNAME_2 = "itemsearch2@example.com";

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

    // Act - Search with pagination (take only 1 result). Both members match
    // "itemsearch", so `total` only reaches 2 once Examine has indexed both -
    // poll until it does, rather than asserting the moment either member is
    // indexed. That removes the original race (0/1/2 depending on how many of
    // the two are indexed yet) while still exercising a genuine multi-match
    // result set, so `items.length` truly proves `take: 1` is capping the
    // response rather than just reflecting a corpus of one.
    const maxAttempts = 20;
    const pollIntervalMs = 500;
    let data: any;
    let attempt = 0;
    for (; attempt < maxAttempts; attempt++) {
      const result = await GetItemMemberSearchTool.handler(
        { query: "itemsearch", take: 1 } as any,
        createMockRequestHandlerExtra()
      );
      data = validateToolResponse(GetItemMemberSearchTool, result);
      if (data.total >= 2) break;
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
    if (data.total < 2) {
      throw new Error(
        `Both members did not become searchable after ${maxAttempts} attempts ` +
          `(${maxAttempts * pollIntervalMs}ms); last response: total=${data.total}, ` +
          `items=${JSON.stringify(data.items)}`
      );
    }

    // Assert - take: 1 must cap the response to a single item even though two
    // members match the query
    expect(data.items.length).toBe(1);
  });
});
