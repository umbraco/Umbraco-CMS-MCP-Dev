import { GetItemDocumentTypeAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getItemDocumentTypeAncestorsQueryParams, getItemDocumentTypeAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getItemDocumentTypeAncestorsResponse,
});

const GetDocumentTypeAncestorsBatchTool = {
  name: "get-document-type-ancestors-batch",
  description: `Gets the ancestor chain (breadcrumb) for multiple document type Ids in one call.
  Returns one entry per requested Id, each containing that Id's chain of ancestors.
  Differs from get-document-type-ancestors which returns the tree-style ancestors of a single Id.`,
  inputSchema: getItemDocumentTypeAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetItemDocumentTypeAncestorsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemDocumentTypeAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemDocumentTypeAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentTypeAncestorsBatchTool);
