import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getTreeDictionaryChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDictionaryChildrenTool = CreateUmbracoReadTool(
  "get-dictionary-children",
  "Gets the children of a dictionary item by Id",
  getTreeDictionaryChildrenQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeDictionaryChildren(params);
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

export default GetDictionaryChildrenTool;
