import { deleteUserAvatarByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const DeleteUserAvatarByIdTool = {
  name: "delete-user-avatar-by-id",
  description: "Deletes an avatar for a specific user by ID (admin only or self-service)",
  inputSchema: deleteUserAvatarByIdParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteUserAvatarById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteUserAvatarByIdParams.shape>;

export default withStandardDecorators(DeleteUserAvatarByIdTool);
