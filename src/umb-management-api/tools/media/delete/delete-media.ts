import { UmbracoManagementClient } from "@umb-management-client";
import { deleteMediaByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteMediaTool = {
  name: "delete-media",
  description: "Deletes a media item by Id",
  schema: deleteMediaByIdParams.shape,
  isReadOnly: false,
  slices: ['delete'],
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

export default withStandardDecorators(DeleteMediaTool);
