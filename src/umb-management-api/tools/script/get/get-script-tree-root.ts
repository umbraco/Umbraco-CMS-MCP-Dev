import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { GetTreeScriptRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeScriptRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetScriptTreeRootTool = CreateUmbracoReadTool(
  "get-script-tree-root",
  "Gets script tree root",
  getTreeScriptRootQueryParams.shape,
  async (model: GetTreeScriptRootParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeScriptRoot(model);

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

export default GetScriptTreeRootTool;