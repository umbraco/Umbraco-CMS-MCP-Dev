import { GetTreeMediaAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeMediaAncestorsQueryParams, getTreeMediaAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
