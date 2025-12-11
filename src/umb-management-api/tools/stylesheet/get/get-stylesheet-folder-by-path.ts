import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getStylesheetFolderByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetStylesheetFolderByPathTool = CreateUmbracoReadTool(
  "get-stylesheet-folder-by-path",
  "Gets a stylesheet folder by its path",
  getStylesheetFolderByPathParams.shape,
  async (model: { path: string }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getStylesheetFolderByPath(model.path);

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

export default GetStylesheetFolderByPathTool;