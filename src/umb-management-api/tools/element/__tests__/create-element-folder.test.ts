import CreateElementFolderTool from "../folders/post/create-element-folder.js";
import { ElementFolderBuilder } from "./helpers/element-folder-builder.js";
import { UmbracoManagementClient } from "@umb-management-client";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_FOLDER_NAME = "_Test Create Element Folder";
const TEST_PARENT_FOLDER_NAME = "_Test Create Element Parent Folder";
const TEST_CHILD_FOLDER_NAME = "_Test Create Element Child Folder";

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

  it("should create a folder at root", async () => {
    // Arrange & Act
    const result = await CreateElementFolderTool.handler(
      { name: TEST_FOLDER_NAME } as any,
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should create a folder under a parent folder", async () => {
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

    // Assert
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
