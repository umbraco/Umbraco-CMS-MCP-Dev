import { getSearchIndexesByIndexAliasParams, getSearchIndexesByIndexAliasResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetSearchIndexTool = {
  name: "get-search-index",
  description: `Gets a single search index by its alias (e.g. "Umb_Content", "Umb_PublishedContent", "Umb_Media", "Umb_Members", "Umb_Elements").
  Returns the indexAlias, providerName, documentCount and healthStatus (Healthy, Rebuilding, Corrupted, Empty, Unknown).
  Use get-search-indexes to discover the available aliases.`,
  inputSchema: getSearchIndexesByIndexAliasParams.shape,
  outputSchema: getSearchIndexesByIndexAliasResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['diagnostics'],
  handler: (async ({ indexAlias }: { indexAlias: string }) => {
    return executeGetApiCall((client) =>
      client.getSearchIndexesByIndexAlias(indexAlias, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getSearchIndexesByIndexAliasParams.shape, typeof getSearchIndexesByIndexAliasResponse.shape>;

export default withStandardDecorators(GetSearchIndexTool);
