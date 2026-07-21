import { GetItemDataTypeAncestorsParams } from "@/umbraco-api/schemas/index.js";
import { getItemDataTypeAncestorsQueryParams, getItemDataTypeAncestorsResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getItemDataTypeAncestorsResponse,
});

const GetDataTypeAncestorsBatchTool = {
  name: "get-data-type-ancestors-batch",
  description: `Gets the ancestor chain (breadcrumb) for multiple data type Ids in one call.
  Returns one entry per requested Id, each containing that Id's chain of ancestors.
  Differs from get-data-type-ancestors which returns the tree-style ancestors of a single Id.`,
  inputSchema: getItemDataTypeAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetItemDataTypeAncestorsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemDataTypeAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemDataTypeAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDataTypeAncestorsBatchTool);
