import { UmbracoManagementClient } from "@umb-management-client";
import { deleteStylesheetFolderByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteStylesheetFolderTool = {
  name: "delete-stylesheet-folder",
  description: "Deletes a stylesheet folder by its path",
  schema: deleteStylesheetFolderByPathParams.shape,
  isReadOnly: false,
  slices: ['delete', 'folders'],
  handler: async (model: { path: string }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.deleteStylesheetFolderByPath(model.path);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof deleteStylesheetFolderByPathParams.shape>;

export default withStandardDecorators(DeleteStylesheetFolderTool);