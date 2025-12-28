import { UmbracoManagementClient } from "@umb-management-client";
import { CreateStylesheetFolderRequestModel } from "@/umb-management-api/schemas/index.js";
import { postStylesheetFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

export class StylesheetFolderBuilder {
  private model: Partial<CreateStylesheetFolderRequestModel> = {};
  private createdPath: string | null = null;
  private createdItem: any | null = null;

  withName(name: string): StylesheetFolderBuilder {
    this.model.name = name;
    return this;
  }

  withPath(path: string): StylesheetFolderBuilder {
    this.model.parent = { path };
    return this;
  }

  build(): CreateStylesheetFolderRequestModel {
    if (!this.model.name) {
      throw new Error("Name is required for stylesheet folder");
    }
    return this.model as CreateStylesheetFolderRequestModel;
  }

  async create(): Promise<StylesheetFolderBuilder> {
    const client = UmbracoManagementClient.getClient();
    const validatedModel = postStylesheetFolderBody.parse(this.model);
    
    await client.postStylesheetFolder(validatedModel);
    
    // Find the created stylesheet folder by name using the helper
    const { StylesheetHelper } = await import("./stylesheet-helper.js");
    const foundItems = await StylesheetHelper.findStylesheetFolders(validatedModel.name!);
    
    if (!foundItems || foundItems.length === 0) {
      throw new Error(`Failed to find created stylesheet folder with name: ${validatedModel.name}`);
    }
    
    this.createdItem = foundItems[0];
    this.createdPath = foundItems[0].path || validatedModel.name!;
    return this;
  }

  async verify(): Promise<boolean> {
    if (!this.createdPath) {
      throw new Error("No stylesheet folder has been created yet");
    }
    try {
      const client = UmbracoManagementClient.getClient();
      await client.getStylesheetFolderByPath(this.createdPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  getPath(): string {
    if (!this.createdPath) {
      throw new Error("No stylesheet folder has been created yet");
    }
    return this.createdPath;
  }

  getItem(): any {
    if (!this.createdItem) {
      throw new Error("No stylesheet folder has been created yet");
    }
    return this.createdItem;
  }

  async cleanup(): Promise<void> {
    if (this.createdPath) {
      try {
        const client = UmbracoManagementClient.getClient();
        await client.deleteStylesheetFolderByPath(this.createdPath);
      } catch (error) {
        console.error("Error cleaning up stylesheet folder:", error);
      }
    }
  }
}