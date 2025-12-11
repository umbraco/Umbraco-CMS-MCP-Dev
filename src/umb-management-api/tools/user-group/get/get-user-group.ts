import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getUserGroupByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetUserGroupTool = CreateUmbracoReadTool(
  "get-user-group",
  "Gets a user group by Id",
  getUserGroupByIdParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserGroupById(id);

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

export default GetUserGroupTool;
