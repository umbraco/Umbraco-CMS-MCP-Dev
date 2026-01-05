import { deleteScriptByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const DeleteScriptTool = {
  name: "delete-script",
  description: "Deletes a script by path",
  inputSchema: deleteScriptByPathParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete'],
  handler: (async ({ path }: { path: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteScriptByPath(path, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteScriptByPathParams.shape>;

export default withStandardDecorators(DeleteScriptTool);
