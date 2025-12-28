import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreePartialViewChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreePartialViewChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetPartialViewChildrenTool = {
  name: "get-partial-view-children",
  description: "Gets the children of a partial view in the tree structure",
  schema: getTreePartialViewChildrenQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (model: GetTreePartialViewChildrenParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreePartialViewChildren(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreePartialViewChildrenQueryParams.shape>;

export default withStandardDecorators(GetPartialViewChildrenTool);