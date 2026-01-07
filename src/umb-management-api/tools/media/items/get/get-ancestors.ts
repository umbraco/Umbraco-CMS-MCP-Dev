import { GetTreeMediaAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeMediaAncestorsQueryParams, getTreeMediaAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

const outputSchema = z.object({
  items: getTreeMediaAncestorsResponse,
});

const GetMediaAncestorsTool = {
  name: "get-media-ancestors",
  description: "Gets ancestor items for a media.",
  inputSchema: getTreeMediaAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeMediaAncestorsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getTreeMediaAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeMediaAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMediaAncestorsTool);
