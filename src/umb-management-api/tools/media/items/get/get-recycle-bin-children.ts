import { UmbracoManagementClient } from "@umb-management-client";
import { getRecycleBinMediaChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type GetRecycleBinMediaChildrenParams = z.infer<typeof getRecycleBinMediaChildrenQueryParams>;

const GetRecycleBinMediaChildrenTool = {
  name: "get-recycle-bin-media-children",
  description: "Gets child items for a media item in the recycle bin.",
  schema: getRecycleBinMediaChildrenQueryParams.shape,
  isReadOnly: true,
  slices: ['tree', 'recycle-bin'],
  handler: async (params: GetRecycleBinMediaChildrenParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRecycleBinMediaChildren(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getRecycleBinMediaChildrenQueryParams.shape>;

export default withStandardDecorators(GetRecycleBinMediaChildrenTool);
