import { getItemDocumentTypeSearchQueryParams, getItemDocumentTypeSearchResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { GetItemDocumentTypeSearchParams } from "@/umbraco-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const SearchDocumentTypeTool = {
  name: "search-document-type",
  description: "Search for document types by name",
  inputSchema: getItemDocumentTypeSearchQueryParams.shape,
  outputSchema: getItemDocumentTypeSearchResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['search'],
  handler: (async (model: GetItemDocumentTypeSearchParams) => {
    return executeGetApiCall((client) =>
      client.getItemDocumentTypeSearch(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemDocumentTypeSearchQueryParams.shape, typeof getItemDocumentTypeSearchResponse.shape>;

export default withStandardDecorators(SearchDocumentTypeTool);
