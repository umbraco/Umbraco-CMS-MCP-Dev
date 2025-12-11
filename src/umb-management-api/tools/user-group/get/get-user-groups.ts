import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getUserGroupQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetUserGroupsTool = CreateUmbracoReadTool(
  "get-user-groups",
  "Gets all user groups",
  getUserGroupQueryParams.shape,
  async ({ skip, take }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserGroup({ skip, take });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }
);

export default GetUserGroupsTool;
