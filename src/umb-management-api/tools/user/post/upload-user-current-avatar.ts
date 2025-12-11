import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { postUserCurrentAvatarBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const UploadUserCurrentAvatarTool = CreateUmbracoWriteTool(
  "upload-user-current-avatar",
  "Uploads an avatar for the current authenticated user",
  postUserCurrentAvatarBody.shape,
  async ({ file }) => {
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
  }
);

export default UploadUserCurrentAvatarTool;