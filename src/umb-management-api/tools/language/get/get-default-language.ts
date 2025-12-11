import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getItemLanguageDefaultResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDefaultLanguageTool = CreateUmbracoReadTool(
  "get-default-language",
  "Gets the default language",
  {}, // No params required
  async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemLanguageDefault();
    // Validate response shape
    const validated = getItemLanguageDefaultResponse.parse(response);
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

export default GetDefaultLanguageTool;
