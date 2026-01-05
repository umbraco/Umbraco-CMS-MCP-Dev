import { getPartialViewByPathParams, getPartialViewByPathResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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