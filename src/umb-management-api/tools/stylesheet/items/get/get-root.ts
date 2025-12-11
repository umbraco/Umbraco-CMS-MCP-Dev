import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { GetTreeStylesheetRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeStylesheetRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetStylesheetRootTool = CreateUmbracoReadTool(
  "get-stylesheet-root",
  "Gets the root stylesheets in the tree structure",
  getTreeStylesheetRootQueryParams.shape,
  async (model: GetTreeStylesheetRootParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeStylesheetRoot(model);

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

export default GetStylesheetRootTool;