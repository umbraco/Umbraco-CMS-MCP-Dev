import { getMediaByIdReferencedByParams, getMediaByIdReferencedByQueryParams, getMediaByIdReferencedByResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const inputSchema = z.object({
  ...getMediaByIdReferencedByParams.shape,
  ...getMediaByIdReferencedByQueryParams.shape,
}).shape;

const GetMediaByIdReferencedByTool = {
  name: "get-media-by-id-referenced-by",
  description: `Get items that reference a specific media item
  Use this to find all content, documents, or other items that are currently referencing a specific media item.`,
  inputSchema,
  outputSchema: getMediaByIdReferencedByResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['references'],
  handler: (async ({ id, skip, take }: { id: string; skip?: number; take?: number }) => {
    return executeGetApiCall((client) =>
      client.getMediaByIdReferencedBy(id, { skip, take }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema, typeof getMediaByIdReferencedByResponse.shape>;

export default withStandardDecorators(GetMediaByIdReferencedByTool);
