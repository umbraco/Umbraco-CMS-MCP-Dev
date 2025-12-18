import { UmbracoManagementClient } from "@umb-management-client";
import { postUserAvatarByIdParams, postUserAvatarByIdBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const uploadUserAvatarByIdSchema = {
  ...postUserAvatarByIdParams.shape,
  ...postUserAvatarByIdBody.shape
};

const UploadUserAvatarByIdTool = {
  name: "upload-user-avatar-by-id",
  description: "Uploads an avatar for a specific user by ID (admin only or self-service)",
  schema: uploadUserAvatarByIdSchema,
  isReadOnly: false,
  slices: ['update'],
  handler: async ({ id, file }: { id: string; file: { id: string } }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postUserAvatarById(id, { file });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof uploadUserAvatarByIdSchema>;

export default withStandardDecorators(UploadUserAvatarByIdTool);