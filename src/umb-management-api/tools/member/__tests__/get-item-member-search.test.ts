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
      { query: TEST_MEMBER_USERNAME, take: 100, skip: undefined, allowedMemberTypes: undefined },
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
      { query: uniqueQuery, take: 100, skip: undefined, allowedMemberTypes: undefined },
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

    // Act - Search with pagination (take only 1 result)
    const result = await GetItemMemberSearchTool.handler(
      { query: "itemsearch", skip: 0, take: 1, allowedMemberTypes: undefined },
      createMockRequestHandlerExtra()
    );

    // Assert - Validate response against tool's output schema
    const data = validateToolResponse(GetItemMemberSearchTool, result);
    expect(data.items.length).toBeLessThanOrEqual(1);
  });
});
