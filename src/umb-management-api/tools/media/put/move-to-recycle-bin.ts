import { UmbracoManagementClient } from "@umb-management-client";
import { putMediaByIdMoveToRecycleBinParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const MoveMediaToRecycleBinTool = {
  name: "move-media-to-recycle-bin",
  description: "Move a media item to the recycle bin",
  schema: putMediaByIdMoveToRecycleBinParams.shape,
  isReadOnly: false,
  slices: ['move', 'recycle-bin'],
  handler: async ({ id }: { id: string }) => {
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
  },
} satisfies ToolDefinition<typeof putMediaByIdMoveToRecycleBinParams.shape>;

export default withStandardDecorators(MoveMediaToRecycleBinTool);
