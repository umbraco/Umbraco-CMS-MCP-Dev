import { UmbracoManagementClient } from "@umb-management-client";
import { getItemMemberTypeSearchQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const SearchMemberTypeItemsTool = {
  name: "search-member-type-items",
  description: "Searches for member type items",
  schema: getItemMemberTypeSearchQueryParams.shape,
  isReadOnly: true,
  slices: ['search'],
  handler: async (params: any) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemMemberTypeSearch(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getItemMemberTypeSearchQueryParams.shape>;

export default withStandardDecorators(SearchMemberTypeItemsTool);
