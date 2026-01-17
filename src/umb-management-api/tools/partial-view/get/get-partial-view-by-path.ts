import { getPartialViewByPathParams, getPartialViewByPathResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetPartialViewByPathTool = {
  name: "get-partial-view-by-path",
  description: "Gets a partial view by its path",
  inputSchema: getPartialViewByPathParams.shape,
  outputSchema: getPartialViewByPathResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ path }: { path: string }) => {
    return executeGetApiCall((client) =>
      client.getPartialViewByPath(path, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getPartialViewByPathParams.shape, typeof getPartialViewByPathResponse.shape>;

export default withStandardDecorators(GetPartialViewByPathTool);