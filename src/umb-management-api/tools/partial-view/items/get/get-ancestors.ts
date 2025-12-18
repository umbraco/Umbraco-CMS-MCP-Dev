import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreePartialViewAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreePartialViewAncestorsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetPartialViewAncestorsTool = {
  name: "get-partial-view-ancestors",
  description: "Gets the ancestors of a partial view in the tree structure",
  schema: getTreePartialViewAncestorsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (model: GetTreePartialViewAncestorsParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreePartialViewAncestors(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreePartialViewAncestorsQueryParams.shape>;

export default withStandardDecorators(GetPartialViewAncestorsTool);