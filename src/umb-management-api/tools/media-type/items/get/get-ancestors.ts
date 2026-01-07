import { GetTreeMediaTypeAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeMediaTypeAncestorsQueryParams, getTreeMediaTypeAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

// Array responses must be wrapped in an object
const outputSchema = z.object({
  items: getTreeMediaTypeAncestorsResponse,
});

const GetMediaTypeAncestorsTool = {
  name: "get-media-type-ancestors",
  description: "Gets the ancestors of a media type",
  inputSchema: getTreeMediaTypeAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeMediaTypeAncestorsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getTreeMediaTypeAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeMediaTypeAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMediaTypeAncestorsTool);
