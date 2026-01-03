import { getLogViewerSavedSearchByNameParams, getLogViewerSavedSearchByNameResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetLogViewerSavedSearchByNameTool = {
  name: "get-log-viewer-saved-search-by-name",
  description: "Gets a saved search by name",
  inputSchema: getLogViewerSavedSearchByNameParams.shape,
  outputSchema: getLogViewerSavedSearchByNameResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['diagnostics'],
  handler: (async ({ name }: { name: string }) => {
    return executeGetApiCall((client) =>
      client.getLogViewerSavedSearchByName(name, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getLogViewerSavedSearchByNameParams.shape, typeof getLogViewerSavedSearchByNameResponse.shape>;

export default withStandardDecorators(GetLogViewerSavedSearchByNameTool);
