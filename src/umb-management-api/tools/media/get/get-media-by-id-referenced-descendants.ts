import { getMediaByIdReferencedDescendantsParams, getMediaByIdReferencedDescendantsQueryParams, getMediaByIdReferencedDescendantsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const inputSchema = z.object({
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
  inputSchema,
  outputSchema: getMediaByIdReferencedDescendantsResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['references'],
  handler: (async ({ id, skip, take }: { id: string; skip?: number; take?: number }) => {
    return executeGetApiCall((client) =>
      client.getMediaByIdReferencedDescendants(id, { skip, take }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema, typeof getMediaByIdReferencedDescendantsResponse.shape>;

export default withStandardDecorators(GetMediaByIdReferencedDescendantsTool);
