import { getLogViewerValidateLogsSizeQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetLogViewerValidateLogsSizeParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetLogViewerValidateLogsSizeTool = {
  name: "get-log-viewer-validate-logs-size",
  description: "Validates the size of the logs, for the given start and end date, or the lase day if not provided",
  inputSchema: getLogViewerValidateLogsSizeQueryParams.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['diagnostics'],
  handler: (async (model: GetLogViewerValidateLogsSizeParams) => {
    return executeVoidApiCall((client) =>
      client.getLogViewerValidateLogsSize(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getLogViewerValidateLogsSizeQueryParams.shape>;

export default withStandardDecorators(GetLogViewerValidateLogsSizeTool);
