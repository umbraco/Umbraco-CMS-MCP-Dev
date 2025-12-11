import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { deleteScriptFolderByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const DeleteScriptFolderTool = CreateUmbracoWriteTool(
  "delete-script-folder",
  "Deletes a script folder by path",
  deleteScriptFolderByPathParams.shape,
  async ({ path }) => {
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
  }
);

export default DeleteScriptFolderTool;