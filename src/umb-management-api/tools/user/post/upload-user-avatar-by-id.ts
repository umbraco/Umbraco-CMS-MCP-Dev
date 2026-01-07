import { postUserAvatarByIdParams, postUserAvatarByIdBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

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
