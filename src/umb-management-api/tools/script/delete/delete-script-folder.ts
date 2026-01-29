import { deleteScriptFolderByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const DeleteScriptFolderTool = {
  name: "delete-script-folder",
  description: "Deletes a script folder by path",
  inputSchema: deleteScriptFolderByPathParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete', 'folders'],
  handler: (async ({ path }: { path: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteScriptFolderByPath(path, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteScriptFolderByPathParams.shape>;

export default withStandardDecorators(DeleteScriptFolderTool);
