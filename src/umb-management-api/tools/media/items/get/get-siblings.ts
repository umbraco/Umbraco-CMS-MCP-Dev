import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeMediaSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type GetTreeMediaSiblingsParams = z.infer<typeof getTreeMediaSiblingsQueryParams>;

const GetMediaSiblingsTool = {
  name: "get-media-siblings",
  description: "Gets sibling media items for a given descendant id",
  schema: getTreeMediaSiblingsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeMediaSiblingsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeMediaSiblings(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeMediaSiblingsQueryParams.shape>;

export default withStandardDecorators(GetMediaSiblingsTool);
