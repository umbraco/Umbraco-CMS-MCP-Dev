import { getScriptFolderByPathParams, getScriptFolderByPathResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetScriptFolderByPathTool = {
  name: "get-script-folder-by-path",
  description: "Gets a script folder by path",
  inputSchema: getScriptFolderByPathParams.shape,
  outputSchema: getScriptFolderByPathResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read', 'folders'],
  handler: (async ({ path }: { path: string }) => {
    return executeGetApiCall((client) =>
      client.getScriptFolderByPath(path, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getScriptFolderByPathParams.shape, typeof getScriptFolderByPathResponse.shape>;

export default withStandardDecorators(GetScriptFolderByPathTool);
