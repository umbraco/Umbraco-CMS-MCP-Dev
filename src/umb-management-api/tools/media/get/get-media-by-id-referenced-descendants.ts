import { UmbracoManagementClient } from "@umb-management-client";
import { getMediaByIdReferencedDescendantsParams, getMediaByIdReferencedDescendantsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const schema = z.object({
  ...getMediaByIdReferencedDescendantsParams.shape,
  ...getMediaByIdReferencedDescendantsQueryParams.shape,
}).shape;

const GetMediaByIdReferencedDescendantsTool = {
  name: "get-media-by-id-referenced-descendants",
  description: `Get descendant references for a media item
  Use this to find all descendant references (child items) that are being referenced for a specific media item.

  Useful for:
  • Impact analysis: Before deleting a media folder, see what content would be affected
  • Dependency tracking: Find all content using media from a specific folder hierarchy
  • Content auditing: Identify which descendant media items are actually being used`,
  schema,
  isReadOnly: true,
  slices: ['references'],
  handler: async ({ id, skip, take }: { id: string; skip?: number; take?: number }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaByIdReferencedDescendants(id, { skip, take });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof schema>;

export default withStandardDecorators(GetMediaByIdReferencedDescendantsTool);