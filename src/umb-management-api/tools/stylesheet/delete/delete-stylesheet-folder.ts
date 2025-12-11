import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { deleteStylesheetFolderByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const DeleteStylesheetFolderTool = CreateUmbracoWriteTool(
  "delete-stylesheet-folder",
  "Deletes a stylesheet folder by its path",
  deleteStylesheetFolderByPathParams.shape,
  async (model: { path: string }) => {
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
);

export default DeleteStylesheetFolderTool;