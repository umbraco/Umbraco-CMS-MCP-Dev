import DeleteUserDataTool from "../delete/delete-user-data.js";
import CreateUserDataTool from "../post/create-user-data.js";
import GetUserDataTool from "../get/get-user-data.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { UmbracoManagementClient } from "@umb-management-client";

const TEST_USER_DATA_GROUP = "_TestUserDataDelete";
const TEST_USER_DATA_IDENTIFIER = "_test-identifier";
const TEST_USER_DATA_VALUE = "_test-value";

describe("delete-user-data", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any remaining test user data
    try {
      const result = await GetUserDataTool.handler(
        { groups: [TEST_USER_DATA_GROUP], identifiers: undefined, skip: undefined, take: 100 },
        createMockRequestHandlerExtra()
      );

      const content = validateToolResponse(GetUserDataTool, result);
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
    const getUserDataResult = await GetUserDataTool.handler(
      { groups: [TEST_USER_DATA_GROUP], identifiers: undefined, skip: undefined, take: 100 },
      createMockRequestHandlerExtra()
    );

    const getUserDataContent = validateToolResponse(GetUserDataTool, getUserDataResult);
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
    const findResult = await GetUserDataTool.handler(
      { groups: [TEST_USER_DATA_GROUP], identifiers: undefined, skip: undefined, take: 100 },
      createMockRequestHandlerExtra()
    );

    const findContent = validateToolResponse(GetUserDataTool, findResult);
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
