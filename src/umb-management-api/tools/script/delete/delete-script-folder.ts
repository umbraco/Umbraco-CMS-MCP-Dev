import { deleteScriptFolderByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
