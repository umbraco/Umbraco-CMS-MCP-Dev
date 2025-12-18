import { UmbracoManagementClient } from "@umb-management-client";
import { putMediaTypeByIdMoveBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { MoveMediaTypeRequestModel } from "@/umb-management-api/schemas/moveMediaTypeRequestModel.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const moveMediaTypeSchema = z.object({
  id: z.string().uuid(),
  data: z.object(putMediaTypeByIdMoveBody.shape),
});

const MoveMediaTypeTool = {
  name: "move-media-type",
  description: "Move a media type to a new location",
  schema: moveMediaTypeSchema.shape,
  isReadOnly: false,
  slices: ['move'],
  handler: async (model: { id: string; data: MoveMediaTypeRequestModel }) => {
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
  },
} satisfies ToolDefinition<typeof moveMediaTypeSchema.shape>;

export default withStandardDecorators(MoveMediaTypeTool);
