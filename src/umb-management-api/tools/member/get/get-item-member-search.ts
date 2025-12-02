import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { GetItemMemberSearchParams } from "@/umb-management-api/schemas/index.js";
import { getItemMemberSearchQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetItemMemberSearchTool = CreateUmbracoTool(
  "get-item-member-search",
  `Searches for member items`,
  getItemMemberSearchQueryParams.shape,
  async (model: GetItemMemberSearchParams) => {
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
  }
);

export default GetItemMemberSearchTool;
