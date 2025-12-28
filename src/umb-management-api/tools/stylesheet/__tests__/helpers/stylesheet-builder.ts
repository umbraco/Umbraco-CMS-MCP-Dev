import { UmbracoManagementClient } from "@umb-management-client";
import { CreateStylesheetRequestModel } from "@/umb-management-api/schemas/index.js";
import { postStylesheetBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { DEFAULT_STYLESHEET_CONTENT } from "./stylesheet-helper.js";

export class StylesheetBuilder {
  private model: Partial<CreateStylesheetRequestModel> = {};
  private createdPath: string | null = null;
  private createdItem: any | null = null;

  withName(name: string): StylesheetBuilder {
    // Ensure the name ends with .css extension
    this.model.name = name.endsWith('.css') ? name : `${name}.css`;
    return this;
  }

  withContent(content: string): StylesheetBuilder {
    this.model.content = content;
    return this;
  }

  withPath(path: string): StylesheetBuilder {
    this.model.parent = { path };
    return this;
  }

  build(): CreateStylesheetRequestModel {
    if (!this.model.name) {
      throw new Error("Name is required for stylesheet");
    }
    if (!this.model.content) {
      throw new Error("Content is required for stylesheet");
    }
    return this.model as CreateStylesheetRequestModel;
  }

  async create(): Promise<StylesheetBuilder> {
    if (!this.model.content) {
      this.model.content = DEFAULT_STYLESHEET_CONTENT;
    }
    
    if (!this.model.parent) {
      this.model.parent = null;
    }
    
    const client = UmbracoManagementClient.getClient();
    const validatedModel = postStylesheetBody.parse(this.model);
    
    await client.postStylesheet(validatedModel);
    
    // Find the created stylesheet by name using the helper
    const { StylesheetHelper } = await import("./stylesheet-helper.js");
    const foundItems = await StylesheetHelper.findStylesheetItems(validatedModel.name!);
    
    if (!foundItems || foundItems.length === 0) {
      throw new Error(`Failed to find created stylesheet with name: ${validatedModel.name}`);
    }
    
    this.createdItem = foundItems[0];
    this.createdPath = foundItems[0].path || validatedModel.name!;
    return this;
  }

  async verify(): Promise<boolean> {
    if (!this.createdPath) {
      throw new Error("No stylesheet has been created yet");
    }
    try {
      const client = UmbracoManagementClient.getClient();
      await client.getStylesheetByPath(this.createdPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  getPath(): string {
    if (!this.createdPath) {
      throw new Error("No stylesheet has been created yet");
    }
    return this.createdPath;
  }

  getItem(): any {
    if (!this.createdItem) {
      throw new Error("No stylesheet has been created yet");
    }
    return this.createdItem;
  }

  async cleanup(): Promise<void> {
    if (this.createdPath) {
      try {
        const client = UmbracoManagementClient.getClient();
        await client.deleteStylesheetByPath(this.createdPath);
      } catch (error) {
        console.error("Error cleaning up stylesheet:", error);
      }
    }
  }
}