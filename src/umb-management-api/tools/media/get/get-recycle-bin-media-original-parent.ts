import { UmbracoManagementClient } from "@umb-management-client";
import { getRecycleBinMediaByIdOriginalParentParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetRecycleBinMediaOriginalParentTool = {
  name: "get-recycle-bin-media-original-parent",
  description: `Get the original parent location of a media item in the recycle bin
  Returns information about where the media item was located before deletion.`,
  schema: getRecycleBinMediaByIdOriginalParentParams.shape,
  isReadOnly: true,
  slices: ['read', 'recycle-bin'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRecycleBinMediaByIdOriginalParent(id);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getRecycleBinMediaByIdOriginalParentParams.shape>;

export default withStandardDecorators(GetRecycleBinMediaOriginalParentTool);