import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeMediaAncestorsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type GetTreeMediaAncestorsParams = z.infer<typeof getTreeMediaAncestorsQueryParams>;

const GetMediaAncestorsTool = {
  name: "get-media-ancestors",
  description: "Gets ancestor items for a media.",
  schema: getTreeMediaAncestorsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeMediaAncestorsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeMediaAncestors(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeMediaAncestorsQueryParams.shape>;

export default withStandardDecorators(GetMediaAncestorsTool);
