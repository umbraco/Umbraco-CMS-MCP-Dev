import { postUserAvatarByIdParams, postUserAvatarByIdBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = z.object({
  ...postUserAvatarByIdParams.shape,
  ...postUserAvatarByIdBody.shape
});

const UploadUserAvatarByIdTool = {
  name: "upload-user-avatar-by-id",
  description: "Uploads an avatar for a specific user by ID (admin only or self-service)",
  inputSchema: inputSchema.shape,
  slices: ['update'],
  handler: (async ({ id, file }: { id: string; file: { id: string } }) => {
    return executeVoidApiCall((client) =>
      client.postUserAvatarById(id, { file }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema.shape>;

export default withStandardDecorators(UploadUserAvatarByIdTool);
