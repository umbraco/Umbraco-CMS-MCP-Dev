import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { GetItemScriptParams } from "@/umb-management-api/schemas/index.js";
import { getItemScriptQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetScriptItemsTool = CreateUmbracoReadTool(
  "get-script-items",
  "Gets script items",
  getItemScriptQueryParams.shape,
  async (model: GetItemScriptParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemScript(model);

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

export default GetScriptItemsTool;