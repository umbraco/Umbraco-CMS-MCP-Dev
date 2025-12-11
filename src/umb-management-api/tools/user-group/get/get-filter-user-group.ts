import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getFilterUserGroupQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetFilterUserGroupTool = CreateUmbracoReadTool(
  "get-filter-user-group",
  "Gets filtered user groups",
  getFilterUserGroupQueryParams.shape,
  async ({ skip, take, filter }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getFilterUserGroup({ skip, take, filter });

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

export default GetFilterUserGroupTool;
