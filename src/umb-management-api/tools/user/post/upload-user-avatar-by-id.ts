import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { postUserAvatarByIdParams, postUserAvatarByIdBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const UploadUserAvatarByIdTool = CreateUmbracoTool(
  "upload-user-avatar-by-id",
  "Uploads an avatar for a specific user by ID (admin only or self-service)",
  {
    ...postUserAvatarByIdParams.shape,
    ...postUserAvatarByIdBody.shape
  },
  async ({ id, file }) => {
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
  }
);

export default UploadUserAvatarByIdTool;