import { ElementFolderBuilder } from "./element-folder-builder.js";
import { ElementTestHelper } from "./element-test-helper.js";
import { UmbracoManagementClient } from "@umb-management-client";
import {
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_FOLDER_NAME = "_Test ElementFolderBuilder";
const TEST_CHILD_FOLDER_NAME = "_Test ElementFolderBuilder Child";

describe("ElementFolderBuilder", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up child folder first (it may be inside parent)
    const client = UmbracoManagementClient.getClient();

    // Try to find and delete child folder
    try {
      const rootResponse = await client.getTreeElementRoot({});
      for (const item of rootResponse.items) {
        if (item.isFolder && item.name === TEST_FOLDER_NAME && item.hasChildren) {
          const children = await client.getTreeElementChildren({
            parentId: item.id,
          });
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

    // Delete top-level test folder
    const rootResponse = await client.getTreeElementRoot({});
    const folder = rootResponse.items.find(
      (item) => item.isFolder && item.name === TEST_FOLDER_NAME
    );
    if (folder) {
      try {
        await client.deleteElementFolderById(folder.id);
      } catch {
        // Ignore
      }
    }
  });

  it("should create a folder and find it in the tree", async () => {
    const builder = await new ElementFolderBuilder(TEST_FOLDER_NAME).create();

    expect(builder.getId()).toBeDefined();
    const item = builder.getItem();
    expect(item).toBeDefined();
    expect(item.isFolder).toBe(true);
    expect(item.name).toBe(TEST_FOLDER_NAME);
  });

  it("should create a child folder under a parent folder", async () => {
    const parentBuilder = await new ElementFolderBuilder(
      TEST_FOLDER_NAME
    ).create();
    const parentId = parentBuilder.getId();

    const childBuilder = await new ElementFolderBuilder(TEST_CHILD_FOLDER_NAME)
      .withParent(parentId)
      .create();

    expect(childBuilder.getId()).toBeDefined();
    const childItem = childBuilder.getItem();
    expect(childItem.isFolder).toBe(true);
    expect(childItem.name).toBe(TEST_CHILD_FOLDER_NAME);
  });

  it("getId should throw if called before create", () => {
    const builder = new ElementFolderBuilder(TEST_FOLDER_NAME);
    expect(() => builder.getId()).toThrow(
      /No element folder has been created yet/
    );
  });

  it("getItem should throw if called before create", () => {
    const builder = new ElementFolderBuilder(TEST_FOLDER_NAME);
    expect(() => builder.getItem()).toThrow(
      /No element folder has been created yet/
    );
  });
});
