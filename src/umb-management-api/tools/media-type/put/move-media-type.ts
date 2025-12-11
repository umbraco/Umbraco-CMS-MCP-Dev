import { UmbracoManagementClient } from "@umb-management-client";
import { putMediaTypeByIdMoveBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { MoveMediaTypeRequestModel } from "@/umb-management-api/schemas/moveMediaTypeRequestModel.js";
import { z } from "zod";

const MoveMediaTypeTool = CreateUmbracoWriteTool(
  "move-media-type",
  "Move a media type to a new location",
  {
    id: z.string().uuid(),
    data: z.object(putMediaTypeByIdMoveBody.shape),
  },
  async (model: { id: string; data: MoveMediaTypeRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putMediaTypeByIdMove(model.id, model.data);

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

export default MoveMediaTypeTool;
