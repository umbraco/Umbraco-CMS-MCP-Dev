import { deletePartialViewFolderByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const DeletePartialViewFolderTool = {
  name: "delete-partial-view-folder",
  description: "Deletes a partial view folder by its path",
  inputSchema: deletePartialViewFolderByPathParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete', 'folders'],
  handler: (async ({ path }: { path: string }) => {
    return executeVoidApiCall((client) =>
      client.deletePartialViewFolderByPath(path, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deletePartialViewFolderByPathParams.shape>;

export default withStandardDecorators(DeletePartialViewFolderTool);