import { UmbracoManagementClient } from "@umb-management-client";
import { getItemDictionaryQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDictionaryByIdArrayTool = {
  name: "get-dictionary-by-id-array",
  description: "Gets dictionary items by IDs (or empty array if no IDs are provided)",
  schema: getItemDictionaryQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (params: { id?: string[] }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemDictionary(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getItemDictionaryQueryParams.shape>;

export default withStandardDecorators(GetDictionaryByIdArrayTool);
