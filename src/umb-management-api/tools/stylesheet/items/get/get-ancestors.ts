import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { GetTreeStylesheetAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeStylesheetAncestorsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetStylesheetAncestorsTool = CreateUmbracoReadTool(
  "get-stylesheet-ancestors",
  "Gets the ancestors of a stylesheet in the tree structure",
  getTreeStylesheetAncestorsQueryParams.shape,
  async (model: GetTreeStylesheetAncestorsParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeStylesheetAncestors(model);

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

export default GetStylesheetAncestorsTool;