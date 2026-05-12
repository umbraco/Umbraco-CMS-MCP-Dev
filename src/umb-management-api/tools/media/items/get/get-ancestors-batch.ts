import { GetItemMediaAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getItemMediaAncestorsQueryParams, getItemMediaAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getItemMediaAncestorsResponse,
});

const GetMediaAncestorsBatchTool = {
  name: "get-media-ancestors-batch",
  description: `Gets the ancestor chain (breadcrumb) for multiple media Ids in one call.
  Returns one entry per requested Id, each containing that Id's chain of ancestors.
  Differs from get-media-ancestors which returns the tree-style ancestors of a single Id.`,
  inputSchema: getItemMediaAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetItemMediaAncestorsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemMediaAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemMediaAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMediaAncestorsBatchTool);
