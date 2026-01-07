import { deleteUserAvatarByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
