import { getTreeDocumentAncestorsQueryParams, getTreeDocumentAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getTreeDocumentAncestorsResponse,
});

const GetDocumentAncestorsTool = {
  name: "get-document-ancestors",
  description: "Gets ancestor items for a document.",
  inputSchema: getTreeDocumentAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree'],
  handler: (async (params: z.infer<typeof getTreeDocumentAncestorsQueryParams>) => {
    return executeGetItemsApiCall((client) =>
      client.getTreeDocumentAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDocumentAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentAncestorsTool);
