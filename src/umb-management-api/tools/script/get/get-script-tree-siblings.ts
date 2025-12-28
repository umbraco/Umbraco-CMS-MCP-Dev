import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreeScriptSiblingsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeScriptSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetScriptTreeSiblingsTool = {
  name: "get-script-tree-siblings",
  description: "Gets sibling scripts for a given descendant path",
  schema: getTreeScriptSiblingsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (model: GetTreeScriptSiblingsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeScriptSiblings(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeScriptSiblingsQueryParams.shape>;

export default withStandardDecorators(GetScriptTreeSiblingsTool);
