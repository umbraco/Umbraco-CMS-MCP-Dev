import { getLogViewerLogQueryParams, getLogViewerLogResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetLogViewerLogParams } from "@/umb-management-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetLogViewerLogTool = {
  name: "get-log-viewer-log",
  description: "Get log viewer logs",
  inputSchema: getLogViewerLogQueryParams.shape,
  outputSchema: getLogViewerLogResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['diagnostics'],
  handler: (async (model: GetLogViewerLogParams) => {
    return executeGetApiCall((client) =>
      client.getLogViewerLog(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getLogViewerLogQueryParams.shape, typeof getLogViewerLogResponse.shape>;

export default withStandardDecorators(GetLogViewerLogTool);
