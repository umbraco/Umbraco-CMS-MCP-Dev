import { getLogViewerLevelQueryParams, getLogViewerLevelResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetLogViewerLevelParams } from "@/umb-management-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetLogViewerLevelTool = {
  name: "get-log-viewer-level",
  description: "Get log viewer levels",
  inputSchema: getLogViewerLevelQueryParams.shape,
  outputSchema: getLogViewerLevelResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['diagnostics'],
  handler: (async (model: GetLogViewerLevelParams) => {
    return executeGetApiCall((client) =>
      client.getLogViewerLevel(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getLogViewerLevelQueryParams.shape, typeof getLogViewerLevelResponse.shape>;

export default withStandardDecorators(GetLogViewerLevelTool);
