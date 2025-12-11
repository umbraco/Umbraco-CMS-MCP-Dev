import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getPartialViewFolderByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetPartialViewFolderByPathTool = CreateUmbracoReadTool(
  "get-partial-view-folder-by-path",
  "Gets a partial view folder by its path",
  getPartialViewFolderByPathParams.shape,
  async (model: { path: string }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getPartialViewFolderByPath(model.path);

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

export default GetPartialViewFolderByPathTool;