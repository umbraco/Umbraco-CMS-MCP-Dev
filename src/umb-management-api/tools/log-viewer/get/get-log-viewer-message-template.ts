import { getLogViewerMessageTemplateQueryParams, getLogViewerMessageTemplateResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetLogViewerMessageTemplateParams } from "@/umb-management-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetLogViewerMessageTemplateTool = {
  name: "get-log-viewer-message-template",
  description: "Get log viewer message templates",
  inputSchema: getLogViewerMessageTemplateQueryParams.shape,
  outputSchema: getLogViewerMessageTemplateResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['diagnostics'],
  handler: (async (model: GetLogViewerMessageTemplateParams) => {
    return executeGetApiCall((client) =>
      client.getLogViewerMessageTemplate(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getLogViewerMessageTemplateQueryParams.shape, typeof getLogViewerMessageTemplateResponse.shape>;

export default withStandardDecorators(GetLogViewerMessageTemplateTool);
