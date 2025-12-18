import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreeScriptRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeScriptRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetScriptTreeRootTool = {
  name: "get-script-tree-root",
  description: "Gets script tree root",
  schema: getTreeScriptRootQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (model: GetTreeScriptRootParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeScriptRoot(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeScriptRootQueryParams.shape>;

export default withStandardDecorators(GetScriptTreeRootTool);