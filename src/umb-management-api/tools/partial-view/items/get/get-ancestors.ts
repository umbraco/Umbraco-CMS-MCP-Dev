import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { GetTreePartialViewAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreePartialViewAncestorsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetPartialViewAncestorsTool = CreateUmbracoReadTool(
  "get-partial-view-ancestors",
  "Gets the ancestors of a partial view in the tree structure",
  getTreePartialViewAncestorsQueryParams.shape,
  async (model: GetTreePartialViewAncestorsParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreePartialViewAncestors(model);

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

export default GetPartialViewAncestorsTool;