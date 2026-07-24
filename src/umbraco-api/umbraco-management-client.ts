import { getUmbracoManagementAPI } from "@/umbraco-api/api/umbracoManagementAPI.js";
import { getTemporaryFileAPI } from "@/umbraco-api/temporary-file/index.js";

type UmbracoManagementClientType = ReturnType<typeof getUmbracoManagementAPI> &
  ReturnType<typeof getTemporaryFileAPI>;

export class UmbracoManagementClient {
  private static instance: UmbracoManagementClientType | null = null;

  private constructor() {}

  public static getClient() {
    if (this.instance === null) {
      this.instance = {
        ...getUmbracoManagementAPI(),
        ...getTemporaryFileAPI(),
      };
    }
    return this.instance;
  }
}
