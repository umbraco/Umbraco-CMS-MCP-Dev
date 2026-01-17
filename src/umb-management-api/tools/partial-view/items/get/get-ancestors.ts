
import { GetTreePartialViewAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreePartialViewAncestorsQueryParams, getTreePartialViewAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getTreePartialViewAncestorsResponse,
});

const GetPartialViewAncestorsTool = {
  name: "get-partial-view-ancestors",
  description: "Gets the ancestors of a partial view in the tree structure",
  inputSchema: getTreePartialViewAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (model: GetTreePartialViewAncestorsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getTreePartialViewAncestors(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreePartialViewAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetPartialViewAncestorsTool);