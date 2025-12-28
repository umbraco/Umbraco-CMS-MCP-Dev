import { UmbracoManagementClient } from "@umb-management-client";
import { CreatePartialViewRequestModel } from "@/umb-management-api/schemas/index.js";
import { postPartialViewBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { DEFAULT_PARTIAL_VIEW_CONTENT } from "./partial-view-helper.js";

export class PartialViewBuilder {
  private model: Partial<CreatePartialViewRequestModel> = {};
  private createdPath: string | null = null;
  private createdItem: any | null = null;

  withName(name: string): PartialViewBuilder {
    // Ensure the name ends with .cshtml extension
    this.model.name = name.endsWith('.cshtml') ? name : `${name}.cshtml`;
    return this;
  }

  withContent(content: string): PartialViewBuilder {
    this.model.content = content;
    return this;
  }

  withParent(parentPath: string): PartialViewBuilder {
    this.model.parent = { path: parentPath };
    return this;
  }

  build(): CreatePartialViewRequestModel {
    if (!this.model.name) {
      throw new Error("Name is required for partial view");
    }
    if (!this.model.content) {
      throw new Error("Content is required for partial view");
    }
    return this.model as CreatePartialViewRequestModel;
  }

  async create(): Promise<PartialViewBuilder> {
    if (!this.model.content) {
      this.model.content = DEFAULT_PARTIAL_VIEW_CONTENT;
    }
    
    if (!this.model.parent) {
      this.model.parent = null;
    }
    
    const client = UmbracoManagementClient.getClient();
    const validatedModel = postPartialViewBody.parse(this.model);
    
    await client.postPartialView(validatedModel);
    
    // Find the created partial view by name using the helper
    const { PartialViewHelper } = await import("./partial-view-helper.js");
    const foundItems = await PartialViewHelper.findPartialViews(validatedModel.name!);
    
    if (!foundItems || foundItems.length === 0) {
      throw new Error(`Failed to find created partial view with name: ${validatedModel.name}`);
    }
    
    this.createdItem = foundItems[0];
    this.createdPath = foundItems[0].path || validatedModel.name!;
    return this;
  }

  async verify(): Promise<boolean> {
    if (!this.createdPath) {
      throw new Error("No partial view has been created yet");
    }
    try {
      const client = UmbracoManagementClient.getClient();
      await client.getPartialViewByPath(this.createdPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  getPath(): string {
    if (!this.createdPath) {
      throw new Error("No partial view has been created yet");
    }
    return this.createdPath;
  }

  getItem(): any {
    if (!this.createdItem) {
      throw new Error("No partial view has been created yet");
    }
    return this.createdItem;
  }

  async cleanup(): Promise<void> {
    if (this.createdPath) {
      try {
        const client = UmbracoManagementClient.getClient();
        await client.deletePartialViewByPath(this.createdPath);
      } catch (error) {
        console.error("Error cleaning up partial view:", error);
      }
    }
  }
}