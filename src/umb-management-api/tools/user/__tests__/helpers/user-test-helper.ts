import { UmbracoManagementClient } from "@umb-management-client";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";

export const DEFAULT_LANGUAGE_ISO_CODE = "en-US";

export class UserTestHelper {
  static async verifyUser(id: string): Promise<boolean> {
    try {
      const client = UmbracoManagementClient.getClient();
      await client.getUserById(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async getUser(id: string, forSnapshot: boolean = false) {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserById(id);
    // Skip Zod validation due to datetime format issues
    const output = response as any;
    if (forSnapshot) {
      output.id = BLANK_UUID;
      if (output.createDate) output.createDate = "NORMALIZED_DATE";
      if (output.updateDate) output.updateDate = "NORMALIZED_DATE";
      if (output.lastLoginDate) output.lastLoginDate = "NORMALIZED_DATE";
      if (output.lastPasswordChangeDate) output.lastPasswordChangeDate = "NORMALIZED_DATE";
    }
    return output;
  }

  static async findUsers(email?: string, forSnapshot: boolean = false) {
    const client = UmbracoManagementClient.getClient();
    let response;

    if (email) {
      // Use filter endpoint to search by email
      response = await client.getFilterUser({ filter: email });
    } else {
      // Use general list endpoint
      response = await client.getUser({ skip: 0, take: 100 });
    }

    // Skip Zod validation due to datetime format issues
    const result = response as any;
    return result.items
      .filter((item: any) => !email || item.email === email)
      .map((item: any) => {
        if (forSnapshot) {
          item.id = BLANK_UUID;
          if (item.createDate) item.createDate = "NORMALIZED_DATE";
          if (item.updateDate) item.updateDate = "NORMALIZED_DATE";
          if (item.lastLoginDate) item.lastLoginDate = "NORMALIZED_DATE";
          if (item.lastPasswordChangeDate) item.lastPasswordChangeDate = "NORMALIZED_DATE";
        }
        return item;
      });
  }

  static async cleanup(email: string): Promise<void> {
    try {
      const client = UmbracoManagementClient.getClient();
      const users = await this.findUsers(email);
      for (const user of users) {
        await client.deleteUserById(user.id);
      }
    } catch (error) {
      console.error(`Error cleaning up user ${email}:`, error);
    }
  }
}