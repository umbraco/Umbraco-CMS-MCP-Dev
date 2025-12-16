import { UmbracoManagementClient } from "@umb-management-client";
import {
  getItemLanguageQueryParams,
  getItemLanguageResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { GetItemLanguageParams } from "@/umb-management-api/schemas/index.js";

const GetLanguageItemsTool = {
  name: "get-language-items",
  description: "Gets language items (optionally filtered by isoCode)",
  schema: getItemLanguageQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (params: GetItemLanguageParams) => {
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
  },
} satisfies ToolDefinition<typeof getItemLanguageQueryParams.shape>;

export default withStandardDecorators(GetLanguageItemsTool);
