import { UmbracoManagementClient } from "@umb-management-client";
import { getItemLanguageDefaultResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDefaultLanguageTool = {
  name: "get-default-language",
  description: "Gets the default language",
  schema: {}, // No params required
  isReadOnly: true,
  slices: ['read'],
  handler: async () => {
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
  },
} satisfies ToolDefinition<{}>;

export default withStandardDecorators(GetDefaultLanguageTool);
