import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getItemMemberTypeSearchQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const SearchMemberTypeItemsTool = CreateUmbracoTool(
  "search-member-type-items",
  "Searches for member type items",
  getItemMemberTypeSearchQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getItemMemberTypeSearch(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
);

export default SearchMemberTypeItemsTool;
