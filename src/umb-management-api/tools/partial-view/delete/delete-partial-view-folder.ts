import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { deletePartialViewFolderByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const DeletePartialViewFolderTool = CreateUmbracoWriteTool(
  "delete-partial-view-folder",
  "Deletes a partial view folder by its path",
  deletePartialViewFolderByPathParams.shape,
  async (model: { path: string }) => {
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
  }
);

export default DeletePartialViewFolderTool;