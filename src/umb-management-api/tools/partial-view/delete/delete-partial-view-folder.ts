import { deletePartialViewFolderByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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