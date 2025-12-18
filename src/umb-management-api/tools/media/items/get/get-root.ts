import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeMediaRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type GetTreeMediaRootParams = z.infer<typeof getTreeMediaRootQueryParams>;

const GetMediaRootTool = {
  name: "get-media-root",
  description: "Gets root items for media.",
  schema: getTreeMediaRootQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeMediaRootParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeMediaRoot(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeMediaRootQueryParams.shape>;

export default withStandardDecorators(GetMediaRootTool);
