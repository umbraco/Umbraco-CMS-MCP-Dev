import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getTreeDictionaryRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDictionaryRootTool = CreateUmbracoReadTool(
  "get-dictionary-root",
  "Gets the root level of the dictionary tree",
  getTreeDictionaryRootQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeDictionaryRoot(params);
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

export default GetDictionaryRootTool;
