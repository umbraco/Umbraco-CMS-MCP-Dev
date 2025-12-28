import { UmbracoManagementClient } from "@umb-management-client";
import { CreateScriptFolderRequestModel } from "@/umb-management-api/schemas/index.js";
import { postScriptFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ScriptTestHelper } from "./script-test-helper.js";

export class ScriptFolderBuilder {
  private model: CreateScriptFolderRequestModel = {
    name: ""
  };

  private createdItem: any = null;

  withName(name: string): ScriptFolderBuilder {
    this.model.name = name;
    return this;
  }

  withParent(parentPath: string): ScriptFolderBuilder {
    this.model.parent = { path: parentPath };
    return this;
  }

  build(): CreateScriptFolderRequestModel {
    return this.model;
  }

  async create(): Promise<ScriptFolderBuilder> {
    if (!this.model.name) {
      throw new Error("Name is required");
    }

    const client = UmbracoManagementClient.getClient();
    const validatedModel = postScriptFolderBody.parse(this.model);

    // Create the script folder
    await client.postScriptFolder(validatedModel);

    // Find the created script folder by name
    const name = this.model.name;
    const createdItem = await ScriptTestHelper.findScript(name);
    if (!createdItem) {
      throw new Error(`Failed to find created script folder with name: ${name}`);
    }

    this.createdItem = createdItem;
    return this;
  }

  getPath(): string {
    if (!this.createdItem) {
      throw new Error("No script folder has been created yet");
    }
    return this.createdItem.path;
  }

  getItem(): any {
    if (!this.createdItem) {
      throw new Error("No script folder has been created yet");
    }
    return this.createdItem;
  }

  async verify(): Promise<boolean> {
    if (!this.createdItem) {
      throw new Error("No script folder has been created yet");
    }
    try {
      const client = UmbracoManagementClient.getClient();
      await client.getScriptFolderByPath(this.createdItem.path);
      return true;
    } catch (error) {
      return false;
    }
  }

  async cleanup(): Promise<void> {
    if (this.createdItem) {
      try {
        const client = UmbracoManagementClient.getClient();
        await client.deleteScriptFolderByPath(this.createdItem.path);
      } catch (error) {
        console.error("Error cleaning up script folder:", error);
      }
    }
  }
}