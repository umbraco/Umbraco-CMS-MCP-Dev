import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import {
  getLanguageQueryParams,
  getLanguageResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetLanguageTool = CreateUmbracoTool(
  "get-language",
  "Gets all languages with optional pagination",
  getLanguageQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getLanguage(params);
    const validated = getLanguageResponse.parse(response);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(validated, null, 2),
        },
      ],
    };
  }
);

export default GetLanguageTool;
