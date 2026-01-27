import { deletePartialViewByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const DeletePartialViewTool = {
  name: "delete-partial-view",
  description: "Deletes a partial view by its path",
  inputSchema: deletePartialViewByPathParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete'],
  handler: (async ({ path }: { path: string }) => {
    return executeVoidApiCall((client) =>
      client.deletePartialViewByPath(path, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deletePartialViewByPathParams.shape>;

export default withStandardDecorators(DeletePartialViewTool);