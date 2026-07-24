import { GetTreeDocumentTypeAncestorsParams } from "@/umbraco-api/schemas/index.js";
import { getTreeDocumentTypeAncestorsQueryParams, getTreeDocumentTypeAncestorsResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getTreeDocumentTypeAncestorsResponse,
});

const GetDocumentTypeAncestorsTool = {
  name: "get-document-type-ancestors",
  description: "Gets the ancestors of a document type",
  inputSchema: getTreeDocumentTypeAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeDocumentTypeAncestorsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getTreeDocumentTypeAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDocumentTypeAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentTypeAncestorsTool);
