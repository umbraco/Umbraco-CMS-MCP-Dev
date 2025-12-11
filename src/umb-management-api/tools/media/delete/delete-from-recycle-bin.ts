import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { deleteMediaByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const DeleteFromRecycleBinTool = CreateUmbracoWriteTool(
  "delete-media-from-recycle-bin",
  "Deletes a media item from the recycle bin by Id.",
  deleteMediaByIdParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteMediaById(id);
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

export default DeleteFromRecycleBinTool;
