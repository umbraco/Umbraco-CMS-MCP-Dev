import { UmbracoManagementClient } from "@umb-management-client";
import { deleteRecycleBinMediaByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type DeleteRecycleBinMediaParams = z.infer<typeof deleteRecycleBinMediaByIdParams>;

const DeleteMediaRecycleBinItemTool = {
  name: "delete-media-recycle-bin-item",
  description: "Permanently deletes a media item from the recycle bin by its id",
  schema: deleteRecycleBinMediaByIdParams.shape,
  isReadOnly: false,
  slices: ['delete', 'recycle-bin'],
  handler: async (params: DeleteRecycleBinMediaParams) => {
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
  },
} satisfies ToolDefinition<typeof deleteRecycleBinMediaByIdParams.shape>;

export default withStandardDecorators(DeleteMediaRecycleBinItemTool);
