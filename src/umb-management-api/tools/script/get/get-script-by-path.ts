import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getScriptByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetScriptByPathTool = CreateUmbracoReadTool(
  "get-script-by-path",
  "Gets a script by path",
  getScriptByPathParams.shape,
  async ({ path }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getScriptByPath(path);

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

export default GetScriptByPathTool;