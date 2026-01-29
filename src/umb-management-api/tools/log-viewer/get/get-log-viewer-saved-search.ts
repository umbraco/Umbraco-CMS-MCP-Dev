import { getLogViewerSavedSearchQueryParams, getLogViewerSavedSearchResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetLogViewerSavedSearchParams } from "@/umb-management-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetLogViewerSavedSearchTool = {
  name: "get-log-viewer-saved-search",
  description: "Get log viewer saved searches",
  inputSchema: getLogViewerSavedSearchQueryParams.shape,
  outputSchema: getLogViewerSavedSearchResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['diagnostics'],
  handler: (async (model: GetLogViewerSavedSearchParams) => {
    return executeGetApiCall((client) =>
      client.getLogViewerSavedSearch(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getLogViewerSavedSearchQueryParams.shape, typeof getLogViewerSavedSearchResponse.shape>;

export default withStandardDecorators(GetLogViewerSavedSearchTool);
