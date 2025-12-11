import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getTreeDictionaryAncestorsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDictionaryAncestorsTool = CreateUmbracoReadTool(
  "get-dictionary-ancestors",
  "Gets the ancestors of a dictionary item by Id",
  getTreeDictionaryAncestorsQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeDictionaryAncestors(params);
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

export default GetDictionaryAncestorsTool;
