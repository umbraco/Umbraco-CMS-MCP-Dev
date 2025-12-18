import { UmbracoManagementClient } from "@umb-management-client";
import { deleteDataTypeFolderByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteDataTypeFolderTool = {
  name: "delete-data-type-folder",
  description: "Deletes a data type folder by Id",
  schema: deleteDataTypeFolderByIdParams.shape,
  isReadOnly: false,
  slices: ['delete', 'folders'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteDataTypeFolderById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof deleteDataTypeFolderByIdParams.shape>;

export default withStandardDecorators(DeleteDataTypeFolderTool);
