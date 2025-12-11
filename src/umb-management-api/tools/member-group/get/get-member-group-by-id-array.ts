import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import {
  getItemMemberGroupQueryParams,
  getItemMemberGroupResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetMemberGroupByIdArrayTool = CreateUmbracoReadTool(
  "get-member-group-by-id-array",
  "Gets member groups by an array of IDs",
  getItemMemberGroupQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemMemberGroup(params);
    // Validate response shape
    getItemMemberGroupResponse.parse(response);
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

export default GetMemberGroupByIdArrayTool;
