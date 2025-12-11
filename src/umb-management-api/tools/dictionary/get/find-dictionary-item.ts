import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { GetDictionaryParams } from "@/umb-management-api/schemas/index.js";
import { getDictionaryQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const FindDictionaryItemTool = CreateUmbracoReadTool(
  "find-dictionary",
  "Finds a dictionary by Id or name",
  getDictionaryQueryParams.shape,
  async (model: GetDictionaryParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getDictionary(model);

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

export default FindDictionaryItemTool;
