import { getSearchIndexesResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetSearchIndexesTool = {
  name: "get-search-indexes",
  description: `Lists all search indexes registered with Umbraco Search.
  Returns an object containing:
  - total: Total number of indexes (number)
  - items: Array of indexes, each with indexAlias, providerName, documentCount and healthStatus (Healthy, Rebuilding, Corrupted, Empty, Unknown)
  Use the returned indexAlias with search-indexed-content, get-search-index or rebuild-search-index.`,
  inputSchema: {},
  outputSchema: getSearchIndexesResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['diagnostics'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getSearchIndexes(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getSearchIndexesResponse.shape>;

export default withStandardDecorators(GetSearchIndexesTool);
