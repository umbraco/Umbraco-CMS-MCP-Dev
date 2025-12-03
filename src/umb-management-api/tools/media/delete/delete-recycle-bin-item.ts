import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { deleteRecycleBinMediaByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const DeleteMediaRecycleBinItemTool = CreateUmbracoTool(
  "delete-media-recycle-bin-item",
  "Permanently deletes a media item from the recycle bin by its id",
  deleteRecycleBinMediaByIdParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    await client.deleteRecycleBinMediaById(params.id);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ success: true, message: "Media item permanently deleted from recycle bin" }),
        },
      ],
    };
  }
);

export default DeleteMediaRecycleBinItemTool;
