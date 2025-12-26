import GetAllMemberGroupsTool from "../get/get-all-member-groups.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { MemberGroupBuilder } from "./helpers/member-group-builder.js";
import { MemberGroupTestHelper } from "./helpers/member-group-helper.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { jest } from "@jest/globals";

const TEST_GROUP_NAME_1 = "_Test Get All Member Groups 1";
const TEST_GROUP_NAME_2 = "_Test Get All Member Groups 2";

describe("get-all-member-groups", () => {
  let originalConsoleError: typeof console.error;
  let builder1: MemberGroupBuilder;
  let builder2: MemberGroupBuilder;

  beforeEach(async () => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    builder1 = new MemberGroupBuilder();
    builder2 = new MemberGroupBuilder();
  });

  afterEach(async () => {
    await MemberGroupTestHelper.cleanup(TEST_GROUP_NAME_1);
    await MemberGroupTestHelper.cleanup(TEST_GROUP_NAME_2);
    console.error = originalConsoleError;
  });

  it("should get all member groups", async () => {
    // Arrange - Create test member groups
    await builder1.withName(TEST_GROUP_NAME_1).create();
    await builder2.withName(TEST_GROUP_NAME_2).create();

    // Act - Get all member groups
    const result = await GetAllMemberGroupsTool.handler(
      { take: 100 },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify our created groups are in the response
    const data = result.structuredContent as { items: any[] };
    const names = data.items ? data.items.map((item: any) => item.name) : [];
    expect(names).toEqual(expect.arrayContaining([TEST_GROUP_NAME_1, TEST_GROUP_NAME_2]));
  });

  it("should support pagination with take parameter", async () => {
    // Arrange - Create test member groups
    await builder1.withName(TEST_GROUP_NAME_1).create();
    await builder2.withName(TEST_GROUP_NAME_2).create();

    // Act - Get member groups with pagination (take only 1)
    const result = await GetAllMemberGroupsTool.handler(
      { take: 1, skip: 0 },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify only one item is returned
    const data = result.structuredContent as { items: any[] };
    expect(data.items.length).toBeLessThanOrEqual(1);
  });

  it("should return empty results when no groups exist with skip beyond total", async () => {
    // Act - Get member groups with skip beyond any possible results
    const result = await GetAllMemberGroupsTool.handler(
      { take: 100, skip: 999999 },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify no items are returned
    const data = result.structuredContent as { items: any[] };
    expect(data.items.length).toBe(0);
  });
});
