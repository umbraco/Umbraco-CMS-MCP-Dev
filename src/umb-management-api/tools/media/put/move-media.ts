import { UmbracoManagementClient } from "@umb-management-client";
import { putMediaByIdMoveBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const schema = {
  id: z.string().uuid(),
  data: z.object(putMediaByIdMoveBody.shape),
};

const MoveMediaTool = {
  name: "move-media",
  description: "Move a media item to a new location",
  schema,
  isReadOnly: false,
  slices: ['move'],
  handler: async (model: { id: string; data: any }) => {
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
  },
} satisfies ToolDefinition<typeof schema>;

export default withStandardDecorators(MoveMediaTool);
