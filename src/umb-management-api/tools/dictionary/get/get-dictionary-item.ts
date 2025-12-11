import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getDictionaryByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDictionaryItemTool = CreateUmbracoReadTool(
  "get-dictionary",
  "Gets a dictionary by Id",
  getDictionaryByIdParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDictionaryById(id);

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

export default GetDictionaryItemTool;
