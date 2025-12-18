import { UmbracoManagementClient } from "@umb-management-client";
import { getRecycleBinMediaReferencedByQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetRecycleBinMediaReferencedByTool = {
  name: "get-recycle-bin-media-referenced-by",
  description: `Get references to deleted media items in the recycle bin
  Use this to find content that still references deleted media items before permanently deleting them.`,
  schema: getRecycleBinMediaReferencedByQueryParams.shape,
  isReadOnly: true,
  slices: ['recycle-bin', 'references'],
  handler: async ({ skip, take }: { skip?: number; take?: number }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRecycleBinMediaReferencedBy({ skip, take });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getRecycleBinMediaReferencedByQueryParams.shape>;

export default withStandardDecorators(GetRecycleBinMediaReferencedByTool);