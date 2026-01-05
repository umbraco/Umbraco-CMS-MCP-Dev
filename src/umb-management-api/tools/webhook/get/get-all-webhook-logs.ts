import { GetWebhookLogsParams } from "@/umb-management-api/schemas/index.js";
import { getWebhookLogsQueryParams, getWebhookLogsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetAllWebhookLogsTool = {
  name: "get-all-webhook-logs",
  description: "Gets logs for all webhooks",
  inputSchema: getWebhookLogsQueryParams.shape,
  outputSchema: getWebhookLogsResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async (params: GetWebhookLogsParams) => {
    return executeGetApiCall((client) =>
      client.getWebhookLogs(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getWebhookLogsQueryParams.shape, typeof getWebhookLogsResponse.shape>;

export default withStandardDecorators(GetAllWebhookLogsTool);
