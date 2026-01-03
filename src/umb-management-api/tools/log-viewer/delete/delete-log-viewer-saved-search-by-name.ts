import { deleteLogViewerSavedSearchByNameParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const DeleteLogViewerSavedSearchByNameTool = {
  name: "delete-log-viewer-saved-search-by-name",
  description: "Deletes a saved search by name",
  inputSchema: deleteLogViewerSavedSearchByNameParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['diagnostics'],
  handler: (async ({ name }: { name: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteLogViewerSavedSearchByName(name, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteLogViewerSavedSearchByNameParams.shape>;

export default withStandardDecorators(DeleteLogViewerSavedSearchByNameTool);
