import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreeScriptAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeScriptAncestorsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetScriptTreeAncestorsTool = {
  name: "get-script-tree-ancestors",
  description: "Gets script tree ancestors",
  schema: getTreeScriptAncestorsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (model: GetTreeScriptAncestorsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeScriptAncestors(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeScriptAncestorsQueryParams.shape>;

export default withStandardDecorators(GetScriptTreeAncestorsTool);