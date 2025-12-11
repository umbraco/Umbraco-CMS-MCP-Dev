import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { deleteStylesheetByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const DeleteStylesheetTool = CreateUmbracoWriteTool(
  "delete-stylesheet",
  "Deletes a stylesheet by its path",
  deleteStylesheetByPathParams.shape,
  async (model: { path: string }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.deleteStylesheetByPath(model.path);

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

export default DeleteStylesheetTool;