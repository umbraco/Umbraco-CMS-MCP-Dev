import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const DeleteUserCurrentAvatarTool = {
  name: "delete-user-current-avatar",
  description: "Deletes the avatar for the current authenticated user",
  inputSchema: {},
  annotations: {
    destructiveHint: true,
  },
  slices: ['current-user'],
  handler: (async () => {
    return executeVoidApiCall((client) =>
      client.deleteUserCurrentAvatar(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}>;

export default withStandardDecorators(DeleteUserCurrentAvatarTool);
