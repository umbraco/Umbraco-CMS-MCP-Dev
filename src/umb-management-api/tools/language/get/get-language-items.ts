import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import {
  getItemLanguageQueryParams,
  getItemLanguageResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetLanguageItemsTool = CreateUmbracoReadTool(
  "get-language-items",
  "Gets language items (optionally filtered by isoCode)",
  getItemLanguageQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemLanguage(params);
    const validated = getItemLanguageResponse.parse(response);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(validated),
        },
      ],
    };
  }
);

export default GetLanguageItemsTool;
