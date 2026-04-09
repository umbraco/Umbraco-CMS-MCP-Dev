import DeleteUserDataTool from "../delete/delete-user-data.js";
import CreateUserDataTool from "../post/create-user-data.js";
import GetUserDataTool from "../get/get-user-data.js";
import { UmbracoManagementClient } from "@umb-management-client";
import {
  BLANK_UUID,
  withCursorPagination,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_USER_DATA_GROUP = "_TestUserDataDelete";
const TEST_USER_DATA_IDENTIFIER = "_test-identifier";
const TEST_USER_DATA_VALUE = "_test-value";

describe("delete-user-data", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any remaining test user data
    try {
      const cursorTool = withCursorPagination(GetUserDataTool);
      const result = await cursorTool.handler(
        { groups: [TEST_USER_DATA_GROUP] },
        createMockRequestHandlerExtra()
      );

      const content = validateToolResponse(cursorTool, result);
      if (content.items && content.items.length > 0) {
        const client = UmbracoManagementClient.getClient();
        for (const item of content.items) {
          try {
            await client.deleteUserDataById(item.key);
          } catch (error) {
            // Ignore errors during cleanup
          }
        }
      }
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  it("should delete user data", async () => {
    // Create user data to delete
    await CreateUserDataTool.handler(
      {
        group: TEST_USER_DATA_GROUP,
        identifier: TEST_USER_DATA_IDENTIFIER,
        value: TEST_USER_DATA_VALUE,
        key: undefined,
      },
      createMockRequestHandlerExtra()
    );

    // Get the created user data to obtain its ID
    const cursorTool = withCursorPagination(GetUserDataTool);
    const getUserDataResult = await cursorTool.handler(
      { groups: [TEST_USER_DATA_GROUP] },
      createMockRequestHandlerExtra()
    );

    const getUserDataContent = validateToolResponse(cursorTool, getUserDataResult);
    expect(getUserDataContent.items).toBeDefined();
    expect(getUserDataContent.items!.length).toBeGreaterThan(0);

    const createdData = getUserDataContent.items![0];

    // Delete the user data
    const result = await DeleteUserDataTool.handler(
      {
        id: createdData.key,
      },
      createMockRequestHandlerExtra()
    );

    // Verify the handler response
    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();

    // Verify the user data no longer exists
    const cursorTool2 = withCursorPagination(GetUserDataTool);
    const findResult = await cursorTool2.handler(
      { groups: [TEST_USER_DATA_GROUP] },
      createMockRequestHandlerExtra()
    );

    const findContent = validateToolResponse(cursorTool2, findResult);
    const found = findContent.items?.find((item) => item.key === createdData.key);
    expect(found).toBeUndefined();
  });

  it("should handle non-existent user data", async () => {
    const result = await DeleteUserDataTool.handler(
      {
        id: BLANK_UUID,
      },
      createMockRequestHandlerExtra()
    );

    // Verify the error response
    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
