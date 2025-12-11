import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { deleteUserGroupBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const DeleteUserGroupsTool = CreateUmbracoWriteTool(
  "delete-user-groups",
  "Deletes all user groups",
  deleteUserGroupBody.shape,
  async ({ userGroupIds }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteUserGroup({ userGroupIds });

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

export default DeleteUserGroupsTool;
