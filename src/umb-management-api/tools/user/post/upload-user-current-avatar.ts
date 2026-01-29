import { postUserCurrentAvatarBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const UploadUserCurrentAvatarTool = {
  name: "upload-user-current-avatar",
  description: "Uploads an avatar for the current authenticated user",
  inputSchema: postUserCurrentAvatarBody.shape,
  slices: ['current-user'],
  handler: (async ({ file }: { file: { id: string } }) => {
    return executeVoidApiCall((client) =>
      client.postUserCurrentAvatar({ file }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof postUserCurrentAvatarBody.shape>;

export default withStandardDecorators(UploadUserCurrentAvatarTool);
