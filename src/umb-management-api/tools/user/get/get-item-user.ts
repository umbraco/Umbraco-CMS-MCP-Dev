import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getItemUserQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetItemUserTool = CreateUmbracoReadTool(
  "get-item-user",
  "Gets user items for selection lists and pickers",
  getItemUserQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemUser(params);

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

export default GetItemUserTool;