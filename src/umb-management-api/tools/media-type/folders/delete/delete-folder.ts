import { UmbracoManagementClient } from "@umb-management-client";
import { deleteMediaTypeFolderByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteMediaTypeFolderTool = {
  name: "delete-media-type-folder",
  description: "Deletes a media type folder by Id",
  schema: deleteMediaTypeFolderByIdParams.shape,
  isReadOnly: false,
  slices: ['delete', 'folders'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteMediaTypeFolderById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof deleteMediaTypeFolderByIdParams.shape>;

export default withStandardDecorators(DeleteMediaTypeFolderTool);
