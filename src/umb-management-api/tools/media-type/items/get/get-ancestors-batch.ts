import { GetItemMediaTypeAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getItemMediaTypeAncestorsQueryParams, getItemMediaTypeAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getItemMediaTypeAncestorsResponse,
});

const GetMediaTypeAncestorsBatchTool = {
  name: "get-media-type-ancestors-batch",
  description: `Gets the ancestor chain (breadcrumb) for multiple media type Ids in one call.
  Returns one entry per requested Id, each containing that Id's chain of ancestors.
  Differs from get-media-type-ancestors which returns the tree-style ancestors of a single Id.`,
  inputSchema: getItemMediaTypeAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetItemMediaTypeAncestorsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemMediaTypeAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemMediaTypeAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMediaTypeAncestorsBatchTool);
