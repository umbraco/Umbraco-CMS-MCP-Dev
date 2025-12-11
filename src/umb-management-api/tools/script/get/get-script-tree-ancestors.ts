import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { GetTreeScriptAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeScriptAncestorsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetScriptTreeAncestorsTool = CreateUmbracoReadTool(
  "get-script-tree-ancestors",
  "Gets script tree ancestors",
  getTreeScriptAncestorsQueryParams.shape,
  async (model: GetTreeScriptAncestorsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeScriptAncestors(model);

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

export default GetScriptTreeAncestorsTool;