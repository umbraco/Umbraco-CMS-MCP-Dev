import CreateElementFolderTool from "../folders/post/create-element-folder.js";
import { ElementFolderBuilder } from "./helpers/element-folder-builder.js";
import { UmbracoManagementClient } from "@umb-management-client";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_FOLDER_NAME = "_Test Create Element Folder";
const TEST_PARENT_FOLDER_NAME = "_Test Create Element Parent Folder";
const TEST_CHILD_FOLDER_NAME = "_Test Create Element Child Folder";

// UUID format: 8-4-4-4-12 hex chars (any variant, not just RFC 4122)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("create-element-folder", () => {
  setupTestEnvironment();

  afterEach(async () => {
    const client = UmbracoManagementClient.getClient();

    // Delete child folder first (it may be nested under parent)
    try {
      const rootResponse = await client.getTreeElementRoot({});
      for (const item of rootResponse.items) {
        if (item.isFolder && item.name === TEST_PARENT_FOLDER_NAME && item.hasChildren) {
          const children = await client.getTreeElementChildren({ parentId: item.id });
          for (const child of children.items) {
            if (child.isFolder && child.name === TEST_CHILD_FOLDER_NAME) {
              await client.deleteElementFolderById(child.id);
            }
          }
        }
      }
    } catch {
      // Ignore cleanup errors
    }

    // Delete top-level folders
    try {
      const rootResponse = await client.getTreeElementRoot({});
      for (const item of rootResponse.items) {
        if (
          item.isFolder &&
          (item.name === TEST_FOLDER_NAME ||
            item.name === TEST_PARENT_FOLDER_NAME ||
            item.name === TEST_CHILD_FOLDER_NAME)
        ) {
          await client.deleteElementFolderById(item.id);
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  it("should create a folder at root and return a real guid", async () => {
    // Arrange & Act
    const result = await CreateElementFolderTool.handler(
      { name: TEST_FOLDER_NAME } as any,
      createMockRequestHandlerExtra()
    );

    // Assert - tool returns void (204 no-content), confirm no error
    expect(result.isError).toBeFalsy();

    // Assert - verify the folder was actually created and has a real guid
    const client = UmbracoManagementClient.getClient();
    const rootResponse = await client.getTreeElementRoot({});
    const created = rootResponse.items.find(
      (item) => item.isFolder && item.name === TEST_FOLDER_NAME
    );

    expect(created).toBeDefined();
    expect(created!.id).toMatch(UUID_REGEX);
  });

  it("should create a folder under a parent folder and return a real guid", async () => {
    // Arrange
    const parentBuilder = await new ElementFolderBuilder(TEST_PARENT_FOLDER_NAME).create();

    // Act
    const result = await CreateElementFolderTool.handler(
      {
        name: TEST_CHILD_FOLDER_NAME,
        parent: { id: parentBuilder.getId() },
      } as any,
      createMockRequestHandlerExtra()
    );

    // Assert - tool returns void (204 no-content), confirm no error
    expect(result.isError).toBeFalsy();

    // Assert - verify the child folder was created under the parent and has a real guid
    const client = UmbracoManagementClient.getClient();
    const childrenResponse = await client.getTreeElementChildren({
      parentId: parentBuilder.getId(),
    });
    const created = childrenResponse.items.find(
      (item) => item.isFolder && item.name === TEST_CHILD_FOLDER_NAME
    );

    expect(created).toBeDefined();
    expect(created!.id).toMatch(UUID_REGEX);
  });
});
