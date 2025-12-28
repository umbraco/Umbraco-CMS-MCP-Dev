import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreeStylesheetChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreeStylesheetChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetStylesheetChildrenTool = {
  name: "get-stylesheet-children",
  description: "Gets the children of a stylesheet in the tree structure",
  schema: getTreeStylesheetChildrenQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (model: GetTreeStylesheetChildrenParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeStylesheetChildren(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getTreeStylesheetChildrenQueryParams.shape>;

export default withStandardDecorators(GetStylesheetChildrenTool);