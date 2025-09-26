import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { deleteUserAvatarByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const DeleteUserAvatarByIdTool = CreateUmbracoTool(
  "delete-user-avatar-by-id",
  "Deletes an avatar for a specific user by ID (admin only or self-service)",
  deleteUserAvatarByIdParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteUserAvatarById(id);

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

export default DeleteUserAvatarByIdTool;