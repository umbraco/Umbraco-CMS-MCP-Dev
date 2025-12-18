import { UmbracoManagementClient } from "@umb-management-client";
import { deleteMediaByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteFromRecycleBinTool = {
  name: "delete-media-from-recycle-bin",
  description: "Deletes a media item from the recycle bin by Id.",
  schema: deleteMediaByIdParams.shape,
  isReadOnly: false,
  slices: ['delete', 'recycle-bin'],
  handler: async ({ id }: { id: string }) => {
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
  },
} satisfies ToolDefinition<typeof deleteMediaByIdParams.shape>;

export default withStandardDecorators(DeleteFromRecycleBinTool);
