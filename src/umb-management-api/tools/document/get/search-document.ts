import { getItemDocumentSearchQueryParams, getItemDocumentSearchResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const SearchDocumentTool = {
  name: "search-document",
  description: "Searches for documents by query, skip, and take.",
  inputSchema: getItemDocumentSearchQueryParams.shape,
  outputSchema: getItemDocumentSearchResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['search'],
  handler: (async (params: z.infer<typeof getItemDocumentSearchQueryParams>) => {
    return executeGetApiCall((client) =>
      client.getItemDocumentSearch(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemDocumentSearchQueryParams.shape, typeof getItemDocumentSearchResponse.shape>;

export default withStandardDecorators(SearchDocumentTool);
