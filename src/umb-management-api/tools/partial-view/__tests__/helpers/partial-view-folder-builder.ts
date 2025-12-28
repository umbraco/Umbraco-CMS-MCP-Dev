import { UmbracoManagementClient } from "@umb-management-client";
import { CreatePartialViewFolderRequestModel } from "@/umb-management-api/schemas/index.js";
import { postPartialViewFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

export class PartialViewFolderBuilder {
  private model: Partial<CreatePartialViewFolderRequestModel> = {};
  private createdPath: string | null = null;
  private createdItem: any | null = null;

  withName(name: string): PartialViewFolderBuilder {
    this.model.name = name;
    return this;
  }

  withParent(parentPath: string): PartialViewFolderBuilder {
    this.model.parent = { path: parentPath };
    return this;
  }

  build(): CreatePartialViewFolderRequestModel {
    if (!this.model.name) {
      throw new Error("Name is required for partial view folder");
    }
    return this.model as CreatePartialViewFolderRequestModel;
  }

  async create(): Promise<PartialViewFolderBuilder> {
    const client = UmbracoManagementClient.getClient();
    const validatedModel = postPartialViewFolderBody.parse(this.model);
    
    await client.postPartialViewFolder(validatedModel);
    
    // Find the created partial view folder by name using the helper
    const { PartialViewHelper } = await import("./partial-view-helper.js");
    const foundItems = await PartialViewHelper.findPartialViewFolders(validatedModel.name!);
    
    if (!foundItems || foundItems.length === 0) {
      throw new Error(`Failed to find created partial view folder with name: ${validatedModel.name}`);
    }
    
    this.createdItem = foundItems[0];
    this.createdPath = foundItems[0].path || validatedModel.name!;
    return this;
  }

  async verify(): Promise<boolean> {
    if (!this.createdPath) {
      throw new Error("No partial view folder has been created yet");
    }
    try {
      const client = UmbracoManagementClient.getClient();
      await client.getPartialViewFolderByPath(this.createdPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  getPath(): string {
    if (!this.createdPath) {
      throw new Error("No partial view folder has been created yet");
    }
    return this.createdPath;
  }

  getItem(): any {
    if (!this.createdItem) {
      throw new Error("No partial view folder has been created yet");
    }
    return this.createdItem;
  }

  async cleanup(): Promise<void> {
    if (this.createdPath) {
      try {
        const client = UmbracoManagementClient.getClient();
        await client.deletePartialViewFolderByPath(this.createdPath);
      } catch (error) {
        console.error("Error cleaning up partial view folder:", error);
      }
    }
  }
}