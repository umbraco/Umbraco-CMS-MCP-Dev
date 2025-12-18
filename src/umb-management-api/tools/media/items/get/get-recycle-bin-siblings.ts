import { UmbracoManagementClient } from "@umb-management-client";
import { getRecycleBinMediaSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type GetRecycleBinMediaSiblingsParams = z.infer<typeof getRecycleBinMediaSiblingsQueryParams>;

const GetMediaRecycleBinSiblingsTool = {
  name: "get-media-recycle-bin-siblings",
  description: "Gets sibling media items in the recycle bin for a given descendant id",
  schema: getRecycleBinMediaSiblingsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree', 'recycle-bin'],
  handler: async (params: GetRecycleBinMediaSiblingsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRecycleBinMediaSiblings(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getRecycleBinMediaSiblingsQueryParams.shape>;

export default withStandardDecorators(GetMediaRecycleBinSiblingsTool);
