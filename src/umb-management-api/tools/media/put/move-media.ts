import { UmbracoManagementClient } from "@umb-management-client";
import { putMediaByIdMoveBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { z } from "zod";

const MoveMediaTool = CreateUmbracoWriteTool(
  "move-media",
  "Move a media item to a new location",
  {
    id: z.string().uuid(),
    data: z.object(putMediaByIdMoveBody.shape),
  },
  async (model: { id: string; data: any }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putMediaByIdMove(model.id, model.data);
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

export default MoveMediaTool;
