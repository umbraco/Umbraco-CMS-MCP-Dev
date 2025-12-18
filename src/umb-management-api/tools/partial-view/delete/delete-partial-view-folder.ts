import { UmbracoManagementClient } from "@umb-management-client";
import { deletePartialViewFolderByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeletePartialViewFolderTool = {
  name: "delete-partial-view-folder",
  description: "Deletes a partial view folder by its path",
  schema: deletePartialViewFolderByPathParams.shape,
  isReadOnly: false,
  slices: ['delete', 'folders'],
  handler: async (model: { path: string }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.deletePartialViewFolderByPath(model.path);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof deletePartialViewFolderByPathParams.shape>;

export default withStandardDecorators(DeletePartialViewFolderTool);