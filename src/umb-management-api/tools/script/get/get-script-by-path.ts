import { getScriptByPathParams, getScriptByPathResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetScriptByPathTool = {
  name: "get-script-by-path",
  description: "Gets a script by path",
  inputSchema: getScriptByPathParams.shape,
  outputSchema: getScriptByPathResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ path }: { path: string }) => {
    return executeGetApiCall((client) =>
      client.getScriptByPath(path, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getScriptByPathParams.shape, typeof getScriptByPathResponse.shape>;

export default withStandardDecorators(GetScriptByPathTool);
