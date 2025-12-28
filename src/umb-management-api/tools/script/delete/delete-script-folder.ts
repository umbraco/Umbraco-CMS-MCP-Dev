import { UmbracoManagementClient } from "@umb-management-client";
import { deleteScriptFolderByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteScriptFolderTool = {
  name: "delete-script-folder",
  description: "Deletes a script folder by path",
  schema: deleteScriptFolderByPathParams.shape,
  isReadOnly: false,
  slices: ['delete', 'folders'],
  handler: async ({ path }: { path: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteScriptFolderByPath(path);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof deleteScriptFolderByPathParams.shape>;

export default withStandardDecorators(DeleteScriptFolderTool);