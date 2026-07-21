import { GetTreeDocumentTypeSearchParams } from "@/umbraco-api/schemas/index.js";
import { getTreeDocumentTypeSearchQueryParams, getTreeDocumentTypeSearchResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentTypeTreeSearchTool = {
  name: "get-document-type-tree-search",
  description: `Searches document types in tree-node shape (with hasChildren and parent for tree navigation).
  Optional itemKind filter accepts 'Item', 'Folder' or 'All'. Use this when paginating tree results;
  for a flat search of items use the corresponding item-search endpoint.`,
  inputSchema: getTreeDocumentTypeSearchQueryParams.shape,
  outputSchema: getTreeDocumentTypeSearchResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree'],
  handler: (async (params: GetTreeDocumentTypeSearchParams) => {
    return executeGetApiCall((client) =>
      client.getTreeDocumentTypeSearch(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDocumentTypeSearchQueryParams.shape, typeof getTreeDocumentTypeSearchResponse.shape>;

export default withStandardDecorators(GetDocumentTypeTreeSearchTool);
