import { getLogViewerLevelCountQueryParams, getLogViewerLevelCountResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetLogViewerLevelCountParams } from "@/umb-management-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetLogViewerLevelCountTool = {
  name: "get-log-viewer-level-count",
  description: "Get log viewer level counts",
  inputSchema: getLogViewerLevelCountQueryParams.shape,
  outputSchema: getLogViewerLevelCountResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['diagnostics'],
  handler: (async (model: GetLogViewerLevelCountParams) => {
    return executeGetApiCall((client) =>
      client.getLogViewerLevelCount(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getLogViewerLevelCountQueryParams.shape, typeof getLogViewerLevelCountResponse.shape>;

export default withStandardDecorators(GetLogViewerLevelCountTool);
