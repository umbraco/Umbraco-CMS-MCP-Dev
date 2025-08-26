import { UmbracoManagementClient } from "@umb-management-client";
import { getItemTemplateSearchResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";

export class TemplateTestHelper {
  static async verifyTemplate(id: string): Promise<boolean> {
    try {
      const client = UmbracoManagementClient.getClient();
      await client.getTemplateById(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async findTemplates(name: string) {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemTemplateSearch({ query: name, skip: 0, take: 100 });
    const result = getItemTemplateSearchResponse.parse(response);
    return result.items.filter((item) => item.name === name);
  }

  static async cleanup(name: string): Promise<void> {
    try {
      const client = UmbracoManagementClient.getClient();
      const items = await this.findTemplates(name);
      for (const item of items) {
        await client.deleteTemplateById(item.id);
      }
    } catch (error) {
      console.error(`Error cleaning up template ${name}:`, error);
    }
  }
}
