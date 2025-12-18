import { UmbracoManagementClient } from "@umb-management-client";
import { GetItemMemberSearchParams } from "@/umb-management-api/schemas/index.js";
import { getItemMemberSearchQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetItemMemberSearchTool = {
  name: "get-item-member-search",
  description: `Searches for member items`,
  schema: getItemMemberSearchQueryParams.shape,
  isReadOnly: true,
  slices: ['search'],
  handler: async (model: GetItemMemberSearchParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getItemMemberSearch(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getItemMemberSearchQueryParams.shape>;

export default withStandardDecorators(GetItemMemberSearchTool);
