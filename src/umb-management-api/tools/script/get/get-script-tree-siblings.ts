import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { GetTreeScriptSiblingsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeScriptSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetScriptTreeSiblingsTool = CreateUmbracoTool(
  "get-script-tree-siblings",
  "Gets sibling scripts for a given descendant path",
  getTreeScriptSiblingsQueryParams.shape,
  async (model: GetTreeScriptSiblingsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeScriptSiblings(model);

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

export default GetScriptTreeSiblingsTool;
