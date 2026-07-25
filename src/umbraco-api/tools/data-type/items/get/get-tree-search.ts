import { GetTreeDataTypeSearchParams } from "@/umbraco-api/schemas/index.js";
import { getTreeDataTypeSearchQueryParams, getTreeDataTypeSearchResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDataTypeTreeSearchTool = {
  name: "get-data-type-tree-search",
  description: `Searches data types in tree-node shape (with hasChildren and parent for tree navigation).
  Use this when paginating through tree results; for a flat search of items use get-data-type-search.
  Optional itemKind filter accepts 'Item', 'Folder' or 'All'.`,
  inputSchema: getTreeDataTypeSearchQueryParams.shape,
  outputSchema: getTreeDataTypeSearchResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree'],
  handler: (async (params: GetTreeDataTypeSearchParams) => {
    return executeGetApiCall((client) =>
      client.getTreeDataTypeSearch(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDataTypeSearchQueryParams.shape, typeof getTreeDataTypeSearchResponse.shape>;

export default withStandardDecorators(GetDataTypeTreeSearchTool);
