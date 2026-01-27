import CreateUserGroupTool from "../post/create-user-group.js";
import { UserGroupTestHelper } from "./helpers/user-group-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_GROUP_NAME = "_Test User Group Created";
const EXISTING_GROUP_NAME = "_Existing User Group";

describe("create-user-group", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await UserGroupTestHelper.cleanup(TEST_GROUP_NAME);
    await UserGroupTestHelper.cleanup(EXISTING_GROUP_NAME);
  });

  it("should create a user group", async () => {
    const result = await CreateUserGroupTool.handler({
      name: TEST_GROUP_NAME,
      alias: TEST_GROUP_NAME.toLowerCase().replace(/\s+/g, "-"),
      icon: undefined,
      sections: ["content"],
      languages: [],
      hasAccessToAllLanguages: true,
      documentStartNode: undefined,
      documentRootAccess: false,
      mediaStartNode: undefined,
      mediaRootAccess: false,
      fallbackPermissions: [],
      permissions: [],
      id: undefined
    }, createMockRequestHandlerExtra());

    const responseData = validateToolResponse(CreateUserGroupTool, result);
    expect(responseData.message).toBe("User group created successfully");
    expect(createSnapshotResult(result, responseData.id)).toMatchSnapshot();

    const items = await UserGroupTestHelper.findUserGroups(TEST_GROUP_NAME);
    expect(createSnapshotResult({ structuredContent: { items } })).toMatchSnapshot();
  });

  it("should handle existing user group", async () => {
    // First create the group
    await CreateUserGroupTool.handler({
      name: EXISTING_GROUP_NAME,
      alias: EXISTING_GROUP_NAME.toLowerCase().replace(/\s+/g, "-"),
      icon: undefined,
      sections: ["content"],
      languages: [],
      hasAccessToAllLanguages: true,
      documentStartNode: undefined,
      documentRootAccess: false,
      mediaStartNode: undefined,
      mediaRootAccess: false,
      fallbackPermissions: [],
      permissions: [],
      id: undefined
    }, createMockRequestHandlerExtra());

    // Try to create it again
    const result = await CreateUserGroupTool.handler({
      name: EXISTING_GROUP_NAME,
      alias: EXISTING_GROUP_NAME.toLowerCase().replace(/\s+/g, "-"),
      icon: undefined,
      sections: ["content"],
      languages: [],
      hasAccessToAllLanguages: true,
      documentStartNode: undefined,
      documentRootAccess: false,
      mediaStartNode: undefined,
      mediaRootAccess: false,
      fallbackPermissions: [],
      permissions: [],
      id: undefined
    }, createMockRequestHandlerExtra());

    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
