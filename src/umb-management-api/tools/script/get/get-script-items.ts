import { UmbracoManagementClient } from "@umb-management-client";
import { GetItemScriptParams } from "@/umb-management-api/schemas/index.js";
import { getItemScriptQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetScriptItemsTool = {
  name: "get-script-items",
  description: "Gets script items",
  schema: getItemScriptQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (model: GetItemScriptParams) => {
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
  },
} satisfies ToolDefinition<typeof getItemScriptQueryParams.shape>;

export default withStandardDecorators(GetScriptItemsTool);