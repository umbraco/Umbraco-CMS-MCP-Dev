import { deleteStylesheetFolderByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const DeleteStylesheetFolderTool = {
  name: "delete-stylesheet-folder",
  description: "Deletes a stylesheet folder by its path",
  inputSchema: deleteStylesheetFolderByPathParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete', 'folders'],
  handler: (async (model: { path: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteStylesheetFolderByPath(model.path, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteStylesheetFolderByPathParams.shape>;

export default withStandardDecorators(DeleteStylesheetFolderTool);
