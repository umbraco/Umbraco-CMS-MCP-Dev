import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreeStylesheetAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeStylesheetAncestorsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetStylesheetAncestorsTool = {
  name: "get-stylesheet-ancestors",
  description: "Gets the ancestors of a stylesheet in the tree structure",
  schema: getTreeStylesheetAncestorsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (model: GetTreeStylesheetAncestorsParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeStylesheetAncestors(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getTreeStylesheetAncestorsQueryParams.shape>;

export default withStandardDecorators(GetStylesheetAncestorsTool);