import { getScriptByPathParams, getScriptByPathResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
