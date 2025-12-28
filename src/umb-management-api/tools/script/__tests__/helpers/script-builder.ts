import { UmbracoManagementClient } from "@umb-management-client";
import { CreateScriptRequestModel } from "@/umb-management-api/schemas/index.js";
import { postScriptBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ScriptTestHelper } from "./script-test-helper.js";

export class ScriptBuilder {
  private model: CreateScriptRequestModel = {
    name: "",
    content: ""
  };

  private createdItem: any = null;

  withName(name: string): ScriptBuilder {
    // Ensure script names have .js extension
    this.model.name = name.endsWith('.js') ? name : `${name}.js`;
    return this;
  }

  withContent(content: string): ScriptBuilder {
    this.model.content = content;
    return this;
  }

  withParent(parentPath: string): ScriptBuilder {
    this.model.parent = { path: parentPath };
    return this;
  }

  build(): CreateScriptRequestModel {
    return this.model;
  }

  async create(): Promise<ScriptBuilder> {
    if (!this.model.name || !this.model.content) {
      throw new Error("Name and content are required");
    }

    const client = UmbracoManagementClient.getClient();
    const validatedModel = postScriptBody.parse(this.model);

    // Create the script
    await client.postScript(validatedModel);

    // Find the created script by name
    const name = this.model.name;
    const createdItem = await ScriptTestHelper.findScript(name);
    if (!createdItem) {
      throw new Error(`Failed to find created script with name: ${name}`);
    }

    this.createdItem = createdItem;
    return this;
  }

  getPath(): string {
    if (!this.createdItem) {
      throw new Error("No script has been created yet");
    }
    return this.createdItem.path;
  }

  getItem(): any {
    if (!this.createdItem) {
      throw new Error("No script has been created yet");
    }
    return this.createdItem;
  }

  async verify(): Promise<boolean> {
    if (!this.createdItem) {
      throw new Error("No script has been created yet");
    }
    try {
      const client = UmbracoManagementClient.getClient();
      await client.getScriptByPath(this.createdItem.path);
      return true;
    } catch (error) {
      return false;
    }
  }

  async cleanup(): Promise<void> {
    if (this.createdItem) {
      try {
        const client = UmbracoManagementClient.getClient();
        await client.deleteScriptByPath(this.createdItem.path);
      } catch (error) {
        console.error("Error cleaning up script:", error);
      }
    }
  }
}