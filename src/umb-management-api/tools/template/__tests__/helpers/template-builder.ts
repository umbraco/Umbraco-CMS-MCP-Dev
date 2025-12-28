import { UmbracoManagementClient } from "@umb-management-client";
import { CreateTemplateRequestModel } from "@/umb-management-api/schemas/index.js";
import { postTemplateBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { TemplateTestHelper } from "./template-helper.js";

export class TemplateBuilder {
  private model: Partial<CreateTemplateRequestModel> = {
    name: "",
    alias: "",
    content: null,
  };
  private createdItem: any = null;
  private masterTemplateAlias: string | null = null;

  withName(name: string): TemplateBuilder {
    this.model.name = name;
    this.model.alias = name.toLowerCase().replace(/\s+/g, "-");
    return this;
  }

  withAlias(alias: string): TemplateBuilder {
    this.model.alias = alias;
    return this;
  }

  withContent(content: string): TemplateBuilder {
    this.model.content = content;
    return this;
  }

  withParent(parentId: string): TemplateBuilder {
    // Store the master template ID - we'll need to get its alias later
    this.masterTemplateAlias = parentId;
    return this;
  }

  build(): Partial<CreateTemplateRequestModel> {
    return this.model;
  }

  async create(): Promise<TemplateBuilder> {
    if (!this.model.name || !this.model.alias) {
      throw new Error("Name and alias are required");
    }

    // If a master template is specified, set up the content with Layout directive
    if (this.masterTemplateAlias) {
      // First get the master template to find its alias
      const client = UmbracoManagementClient.getClient();
      try {
        const masterTemplate = await client.getTemplateById(this.masterTemplateAlias);
        // Set the content with Layout pointing to the master template
        this.model.content = `@using Umbraco.Cms.Web.Common.PublishedModels;
@inherits Umbraco.Cms.Web.Common.Views.UmbracoViewPage
@{
	Layout = "${masterTemplate.alias}.cshtml";
}`;
      } catch (error) {
        console.error("Failed to get master template:", error);
        // Fallback to basic content if master template not found
        this.model.content = this.model.content || "@using Umbraco.Cms.Web.Common.PublishedModels;\n@inherits Umbraco.Cms.Web.Common.Views.UmbracoViewPage\n@{\n\tLayout = null;\n}";
      }
    } else if (!this.model.content) {
      // Set default content if no content is provided
      this.model.content = "@using Umbraco.Cms.Web.Common.PublishedModels;\n@inherits Umbraco.Cms.Web.Common.Views.UmbracoViewPage\n@{\n\tLayout = null;\n}";
    }

    const client = UmbracoManagementClient.getClient();
    const validatedModel = postTemplateBody.parse(this.model);
    await client.postTemplate(validatedModel);
    
    // Get the created template by name
    const response = await TemplateTestHelper.findTemplates(validatedModel.name);
    const createdItem = response.find(
      (item: { name: string }) => item.name === validatedModel.name
    );
    if (!createdItem) {
      throw new Error(
        `Failed to find created template with name: ${validatedModel.name}`
      );
    }
    this.createdItem = createdItem;
    return this;
  }

  async verify(): Promise<boolean> {
    if (!this.createdItem) {
      throw new Error("No template has been created yet");
    }
    return await TemplateTestHelper.verifyTemplate(this.createdItem.id);
  }

  getId(): string {
    if (!this.createdItem) {
      throw new Error("No template has been created yet");
    }
    return this.createdItem.id;
  }

  getCreatedItem(): any {
    if (!this.createdItem) {
      throw new Error("No template has been created yet");
    }
    return this.createdItem;
  }

  getAlias(): string {
    if (!this.model.alias) {
      throw new Error("No alias has been set yet");
    }
    return this.model.alias;
  }

  async cleanup(): Promise<void> {
    if (this.createdItem) {
      try {
        const client = UmbracoManagementClient.getClient();
        await client.deleteTemplateById(this.createdItem.id);
      } catch (error) {
        console.error("Error cleaning up template:", error);
      }
    }
  }

  static async cleanupByName(name: string): Promise<void> {
    await TemplateTestHelper.cleanup(name);
  }
}
