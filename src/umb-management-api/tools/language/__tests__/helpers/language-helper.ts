import { UmbracoManagementClient } from "@umb-management-client";
import { getLanguageByIsoCodeResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";

export class LanguageTestHelper {
  /**
   * Find a language by ISO code using the list endpoint (avoids 404 errors)
   */
  static async findLanguage(isoCode: string) {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getLanguage({ skip: 0, take: 100 });
    return response.items.find((lang) => lang.isoCode === isoCode) ?? null;
  }

  static async verifyLanguage(isoCode: string): Promise<boolean> {
    const language = await this.findLanguage(isoCode);
    return language !== null;
  }

  static async getLanguage(isoCode: string) {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getLanguageByIsoCode(isoCode);
    return getLanguageByIsoCodeResponse.parse(response);
  }

  static async cleanup(isoCode: string): Promise<void> {
    // Check if language exists before attempting to delete to avoid 404 errors
    const exists = await this.findLanguage(isoCode);
    if (!exists) {
      return;
    }

    const client = UmbracoManagementClient.getClient();
    await client.deleteLanguageByIsoCode(isoCode);
  }
}
