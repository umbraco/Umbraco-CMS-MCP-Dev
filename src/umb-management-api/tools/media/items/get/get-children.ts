import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeMediaChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type GetTreeMediaChildrenParams = z.infer<typeof getTreeMediaChildrenQueryParams>;

const GetMediaChildrenTool = {
  name: "get-media-children",
  description: "Gets child items for a media.",
  schema: getTreeMediaChildrenQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeMediaChildrenParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeMediaChildren(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeMediaChildrenQueryParams.shape>;

export default withStandardDecorators(GetMediaChildrenTool);
