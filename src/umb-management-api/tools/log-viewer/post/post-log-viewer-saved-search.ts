import { postLogViewerSavedSearchBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { SavedLogSearchRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const PostLogViewerSavedSearchTool = {
  name: "post-log-viewer-saved-search",
  description: "Create a new log viewer saved search",
  inputSchema: postLogViewerSavedSearchBody.shape,
  slices: ['diagnostics'],
  handler: (async (model: SavedLogSearchRequestModel) => {
    return executeVoidApiCall((client) =>
      client.postLogViewerSavedSearch(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof postLogViewerSavedSearchBody.shape>;

export default withStandardDecorators(PostLogViewerSavedSearchTool);
