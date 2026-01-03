import { getLogViewerMessageTemplateQueryParams, getLogViewerMessageTemplateResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetLogViewerMessageTemplateParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
