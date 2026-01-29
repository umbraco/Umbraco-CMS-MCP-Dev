import { deleteStylesheetByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const DeleteStylesheetTool = {
  name: "delete-stylesheet",
  description: "Deletes a stylesheet by its path",
  inputSchema: deleteStylesheetByPathParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete'],
  handler: (async (model: { path: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteStylesheetByPath(model.path, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteStylesheetByPathParams.shape>;

export default withStandardDecorators(DeleteStylesheetTool);
