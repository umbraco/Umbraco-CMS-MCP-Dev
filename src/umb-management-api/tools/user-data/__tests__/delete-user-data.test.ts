import DeleteUserDataTool from "../delete/delete-user-data.js";
import CreateUserDataTool from "../post/create-user-data.js";
import GetUserDataTool from "../get/get-user-data.js";
import { jest } from "@jest/globals";
import { BLANK_UUID } from "@/constants/constants.js";
import { UmbracoManagementClient } from "@umb-management-client";

const TEST_USER_DATA_GROUP = "_TestUserDataDelete";
const TEST_USER_DATA_IDENTIFIER = "_test-identifier";
const TEST_USER_DATA_VALUE = "_test-value";

describe("delete-user-data", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    // Clean up any remaining test user data
    try {
      const result = await GetUserDataTool.handler(
        { groups: [TEST_USER_DATA_GROUP], take: 100 },
        { signal: new AbortController().signal }
      );

      const content = JSON.parse(result.content[0].text as string) as { items?: Array<{ key: string }> };
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

    console.error = originalConsoleError;
  });

  it("should delete user data", async () => {
    // Create user data to delete
    await CreateUserDataTool.handler(
      {
        group: TEST_USER_DATA_GROUP,
        identifier: TEST_USER_DATA_IDENTIFIER,
        value: TEST_USER_DATA_VALUE,
      },
      { signal: new AbortController().signal }
    );

    // Get the created user data to obtain its ID
    const getUserDataResult = await GetUserDataTool.handler(
      { groups: [TEST_USER_DATA_GROUP], take: 100 },
      { signal: new AbortController().signal }
    );

    const getUserDataContent = JSON.parse(getUserDataResult.content[0].text as string) as { items?: Array<{ key: string }> };
    expect(getUserDataContent.items).toBeDefined();
    expect(getUserDataContent.items!.length).toBeGreaterThan(0);

    const createdData = getUserDataContent.items![0];

    // Delete the user data
    const result = await DeleteUserDataTool.handler(
      {
        id: createdData.key,
      },
      { signal: new AbortController().signal }
    );

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();

    // Verify the user data no longer exists
    const findResult = await GetUserDataTool.handler(
      { groups: [TEST_USER_DATA_GROUP], take: 100 },
      { signal: new AbortController().signal }
    );

    const findContent = JSON.parse(findResult.content[0].text as string) as { items?: Array<{ key: string }> };
    const found = findContent.items?.find((item) => item.key === createdData.key);
    expect(found).toBeUndefined();
  });

  it("should handle non-existent user data", async () => {
    const result = await DeleteUserDataTool.handler(
      {
        id: BLANK_UUID,
      },
      { signal: new AbortController().signal }
    );

    // Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });
});
