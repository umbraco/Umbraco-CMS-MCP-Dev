import { getFilterUserGroupQueryParams, getFilterUserGroupResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import GetFilterUserGroupTool from "../get/get-filter-user-group.js";
import { UserGroupBuilder } from "./helpers/user-group-builder.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

const TEST_GROUP_NAMES = [
  "_Test User Group Filter 1",
  "_Test User Group Filter 2",
  "_Test User Group Filter 3",
  "_Other User Group 1",
  "_Other User Group 2"
];

describe("GetFilterUserGroupTool", () => {
  setupTestEnvironment();
  let builders: UserGroupBuilder[];

  beforeEach(async () => {
    builders = [];
    // Create test user groups
    for (const name of TEST_GROUP_NAMES) {
      const builder = new UserGroupBuilder();
      await builder.withName(name).create();
      builders.push(builder);
    }
  });

  afterEach(async () => {
    // Clean up all test groups
    for (const builder of builders) {
      await builder.cleanup();
    }
  });

  it("should filter user groups by name", async () => {
    const result = await GetFilterUserGroupTool.handler({
      skip: 0,
      take: 100,
      filter: "Filter"
    }, createMockRequestHandlerExtra());

    // Verify the response contains only groups with "Filter" in the name
    const response = validateStructuredContent(result, getFilterUserGroupResponse);
    expect(response.items).toHaveLength(3);
    expect(response.items.every((item: { name: string }) => item.name.includes("Filter"))).toBe(true);
  });

  it("should handle empty filter", async () => {
    const result = await GetFilterUserGroupTool.handler({
      skip: 0,
      take: 100,
      filter: undefined
    }, createMockRequestHandlerExtra());

    // Verify the response contains all groups
    const response = validateStructuredContent(result, getFilterUserGroupResponse);
    expect(response.items.length).toBeGreaterThanOrEqual(TEST_GROUP_NAMES.length);
  });

  it("should handle pagination", async () => {
    const result = await GetFilterUserGroupTool.handler({
      skip: 2,
      take: 2,
      filter: undefined
    }, createMockRequestHandlerExtra());

    // Verify the response contains only 2 items
    const response = validateStructuredContent(result, getFilterUserGroupResponse);
    expect(response.items).toHaveLength(2);
  });
});
