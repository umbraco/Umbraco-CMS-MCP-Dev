import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { GetTreeStylesheetChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreeStylesheetChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetStylesheetChildrenTool = CreateUmbracoReadTool(
  "get-stylesheet-children",
  "Gets the children of a stylesheet in the tree structure",
  getTreeStylesheetChildrenQueryParams.shape,
  async (model: GetTreeStylesheetChildrenParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeStylesheetChildren(model);

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

export default GetStylesheetChildrenTool;