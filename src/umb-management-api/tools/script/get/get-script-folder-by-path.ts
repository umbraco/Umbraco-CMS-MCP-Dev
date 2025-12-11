import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getScriptFolderByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetScriptFolderByPathTool = CreateUmbracoReadTool(
  "get-script-folder-by-path",
  "Gets a script folder by path",
  getScriptFolderByPathParams.shape,
  async ({ path }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getScriptFolderByPath(path);

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

export default GetScriptFolderByPathTool;