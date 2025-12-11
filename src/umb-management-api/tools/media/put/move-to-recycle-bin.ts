import { UmbracoManagementClient } from "@umb-management-client";
import { putMediaByIdMoveToRecycleBinParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";

const MoveMediaToRecycleBinTool = CreateUmbracoWriteTool(
  "move-media-to-recycle-bin",
  "Move a media item to the recycle bin",
  putMediaByIdMoveToRecycleBinParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putMediaByIdMoveToRecycleBin(id);
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

export default MoveMediaToRecycleBinTool;
