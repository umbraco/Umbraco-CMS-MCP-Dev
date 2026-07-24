import { GetItemDocumentAncestorsParams } from "@/umbraco-api/schemas/index.js";
import { getItemDocumentAncestorsQueryParams, getItemDocumentAncestorsResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getItemDocumentAncestorsResponse,
});

const GetDocumentAncestorsBatchTool = {
  name: "get-document-ancestors-batch",
  description: `Gets the ancestor chain (breadcrumb) for multiple document Ids in one call.
  Returns one entry per requested Id, each containing that Id's chain of ancestors.
  Differs from get-document-ancestors which returns the tree-style ancestors of a single Id.`,
  inputSchema: getItemDocumentAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetItemDocumentAncestorsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemDocumentAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemDocumentAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentAncestorsBatchTool);
