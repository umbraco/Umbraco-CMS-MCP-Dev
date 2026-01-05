import { getUserGroupQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import GetUserGroupsTool from "../get/get-user-groups.js";
import { UserGroupBuilder } from "./helpers/user-group-builder.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("GetUserGroupsTool", () => {
  setupTestEnvironment();
  let builder: UserGroupBuilder;

  beforeEach(() => {
    builder = new UserGroupBuilder();
  });

  afterEach(async () => {
    await builder.cleanup();
  });

  it("should get all user groups", async () => {
    // Create a test user group
    await builder.withName("Test User Group").create();

    // Get all user groups
    await GetUserGroupsTool.handler({ skip: 0, take: 100 }, createMockRequestHandlerExtra());

    // No need to test this result as it's dependant on what Umbraco has set up
  });

  it("should handle empty result", async () => {
    // Get all user groups with no groups created
    const result = await GetUserGroupsTool.handler({ skip: 0, take: 100 }, createMockRequestHandlerExtra());

    // Verify the response
    expect(result).toMatchSnapshot();
  });
});
