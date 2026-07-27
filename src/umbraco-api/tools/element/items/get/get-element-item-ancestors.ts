import { getItemElementAncestorsQueryParams, getItemElementAncestorsResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { GetItemElementAncestorsParams } from "@/umbraco-api/schemas/index.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getItemElementAncestorsResponse,
});

const GetElementItemAncestorsTool = {
  name: "get-element-item-ancestors",
  description: `Gets the ancestor chain (breadcrumb) for multiple element Ids in one call.
  Returns one entry per requested Id, each containing that Id's chain of ancestors.
  Differs from get-element-ancestors which returns the tree-style ancestors of a single Id.`,
  inputSchema: getItemElementAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetItemElementAncestorsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemElementAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemElementAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetElementItemAncestorsTool);
