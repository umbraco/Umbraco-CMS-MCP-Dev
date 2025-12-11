import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { GetTreePartialViewChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreePartialViewChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetPartialViewChildrenTool = CreateUmbracoReadTool(
  "get-partial-view-children",
  "Gets the children of a partial view in the tree structure",
  getTreePartialViewChildrenQueryParams.shape,
  async (model: GetTreePartialViewChildrenParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreePartialViewChildren(model);

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

export default GetPartialViewChildrenTool;