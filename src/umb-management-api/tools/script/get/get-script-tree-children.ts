import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreeScriptChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreeScriptChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetScriptTreeChildrenTool = {
  name: "get-script-tree-children",
  description: "Gets script tree children",
  schema: getTreeScriptChildrenQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (model: GetTreeScriptChildrenParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeScriptChildren(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeScriptChildrenQueryParams.shape>;

export default withStandardDecorators(GetScriptTreeChildrenTool);