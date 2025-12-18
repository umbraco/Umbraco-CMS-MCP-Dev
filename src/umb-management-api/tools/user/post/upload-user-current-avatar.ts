import { UmbracoManagementClient } from "@umb-management-client";
import { postUserCurrentAvatarBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const UploadUserCurrentAvatarTool = {
  name: "upload-user-current-avatar",
  description: "Uploads an avatar for the current authenticated user",
  schema: postUserCurrentAvatarBody.shape,
  isReadOnly: false,
  slices: ['current-user'],
  handler: async ({ file }: { file: { id: string } }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postUserCurrentAvatar({ file });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof postUserCurrentAvatarBody.shape>;

export default withStandardDecorators(UploadUserCurrentAvatarTool);