import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { GetTreePartialViewRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreePartialViewRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetPartialViewRootTool = CreateUmbracoReadTool(
  "get-partial-view-root",
  "Gets the root partial views in the tree structure",
  getTreePartialViewRootQueryParams.shape,
  async (model: GetTreePartialViewRootParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreePartialViewRoot(model);

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

export default GetPartialViewRootTool;