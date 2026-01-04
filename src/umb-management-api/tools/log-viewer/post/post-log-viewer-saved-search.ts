import { postLogViewerSavedSearchBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { SavedLogSearchRequestModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
