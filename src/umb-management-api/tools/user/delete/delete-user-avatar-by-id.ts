import { UmbracoManagementClient } from "@umb-management-client";
import { deleteUserAvatarByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteUserAvatarByIdTool = {
  name: "delete-user-avatar-by-id",
  description: "Deletes an avatar for a specific user by ID (admin only or self-service)",
  schema: deleteUserAvatarByIdParams.shape,
  isReadOnly: false,
  slices: ['delete'],
  handler: async ({ id }: { id: string }) => {
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
  },
} satisfies ToolDefinition<typeof deleteUserAvatarByIdParams.shape>;

export default withStandardDecorators(DeleteUserAvatarByIdTool);