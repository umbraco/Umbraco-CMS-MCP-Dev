import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreePartialViewRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreePartialViewRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetPartialViewRootTool = {
  name: "get-partial-view-root",
  description: "Gets the root partial views in the tree structure",
  schema: getTreePartialViewRootQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (model: GetTreePartialViewRootParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreePartialViewRoot(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreePartialViewRootQueryParams.shape>;

export default withStandardDecorators(GetPartialViewRootTool);