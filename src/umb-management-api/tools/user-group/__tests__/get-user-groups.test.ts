import GetUserGroupsTool from "../get/get-user-groups.js";
import { UserGroupBuilder } from "./helpers/user-group-builder.js";
import { UserGroupTestHelper } from "./helpers/user-group-helper.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { withCursorPagination } from "@umbraco-cms/mcp-server-sdk";

const TEST_GROUP_NAME = "Test User Group GetAll";

describe("GetUserGroupsTool", () => {
  setupTestEnvironment();
  let builder: UserGroupBuilder;

  beforeEach(async () => {
    await UserGroupTestHelper.cleanup(TEST_GROUP_NAME);
    builder = new UserGroupBuilder();
  });

  afterEach(async () => {
    await builder.cleanup();
    await UserGroupTestHelper.cleanup(TEST_GROUP_NAME);
  });

  it("should get all user groups", async () => {
    // Create a test user group
    await builder.withName(TEST_GROUP_NAME).create();

    // Get all user groups
    const cursorTool = withCursorPagination(GetUserGroupsTool);
    const result = await cursorTool.handler({}, createMockRequestHandlerExtra());
    const data = validateToolResponse(cursorTool, result);

    // Verify response structure
    expect(data).toHaveProperty("items");
    expect(data).toHaveProperty("total");
  });

  it("should handle empty result", async () => {
    // Get all user groups with no groups created
    const cursorTool = withCursorPagination(GetUserGroupsTool);
    const result = await cursorTool.handler({}, createMockRequestHandlerExtra());
    const data = validateToolResponse(cursorTool, result);

    // Verify the response structure - don't assert exact total as other tests may leave groups
    expect(data).toHaveProperty("items");
    expect(data).toHaveProperty("total");
    expect(data.items.length).toBeGreaterThanOrEqual(5); // At least the 5 default system groups
    expect(data.total).toBeGreaterThanOrEqual(5);
  });
});
