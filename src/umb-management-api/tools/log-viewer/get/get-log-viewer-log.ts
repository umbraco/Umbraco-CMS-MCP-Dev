import { getLogViewerLogQueryParams, getLogViewerLogResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetLogViewerLogParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
