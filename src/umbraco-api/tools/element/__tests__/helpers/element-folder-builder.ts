import { UmbracoManagementClient } from "@umb-management-client";
import { postElementFolderBody } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { CreateFolderRequestModel } from "@/umbraco-api/schemas/index.js";
import { ElementTestHelper } from "./element-test-helper.js";
import type { ElementTreeItemResponseModel } from "@/umbraco-api/schemas/elementTreeItemResponseModel.js";

export class ElementFolderBuilder {
  private model: Partial<CreateFolderRequestModel> = {};
  private createdItem: ElementTreeItemResponseModel | null = null;

  constructor(private name: string) {
    this.model.name = name;
  }

  withParent(parentId: string): this {
    this.model.parent = { id: parentId };
    return this;
  }

  build(): Partial<CreateFolderRequestModel> {
    return this.model;
  }

  async create(): Promise<ElementFolderBuilder> {
    const client = UmbracoManagementClient.getClient();
    const validatedModel = postElementFolderBody.parse(this.model);

    await client.postElementFolder(validatedModel);

    // Find the created folder in the tree by name
    const found = await this.findFolder(this.name);
    if (!found) {
      throw new Error(
        `Failed to find created element folder with name: ${this.name}`
      );
    }

    this.createdItem = found;
    return this;
  }

  private async findFolder(
    name: string
  ): Promise<ElementTreeItemResponseModel | undefined> {
    try {
      const client = UmbracoManagementClient.getClient();

      const rootResponse = await client.getTreeElementRoot({});
      const rootMatch = rootResponse.items.find(
        (item) => item.isFolder && item.name === name
      );
      if (rootMatch) {
        return rootMatch;
      }

      // Check children of folders
      for (const item of rootResponse.items) {
        if (item.isFolder && item.hasChildren) {
          const childrenResponse = await client.getTreeElementChildren({
            parentId: item.id,
          });
          const childMatch = childrenResponse.items.find(
            (child) => child.isFolder && child.name === name
          );
          if (childMatch) {
            return childMatch;
          }
        }
      }

      return undefined;
    } catch (error) {
      console.log(`Error finding element folder '${name}':`, error);
      return undefined;
    }
  }

  getId(): string {
    if (!this.createdItem) {
      throw new Error("No element folder has been created yet");
    }
    return this.createdItem.id;
  }

  getItem(): ElementTreeItemResponseModel {
    if (!this.createdItem) {
      throw new Error("No element folder has been created yet");
    }
    return this.createdItem;
  }

  async cleanup(): Promise<void> {
    if (!this.createdItem) {
      return;
    }
    try {
      const client = UmbracoManagementClient.getClient();
      await client.deleteElementFolderById(this.createdItem.id);
    } catch (error) {
      console.log(
        `Error deleting element folder ${this.createdItem.id}:`,
        error
      );
    }
  }
}
