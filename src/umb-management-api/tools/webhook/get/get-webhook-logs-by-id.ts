import { getWebhookByIdLogsParams, getWebhookByIdLogsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetWebhookLogsTool = {
  name: "get-webhook-logs",
  description: "Gets logs for a specific webhook",
  inputSchema: getWebhookByIdLogsParams.shape,
  outputSchema: getWebhookByIdLogsResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getWebhookByIdLogs(id, undefined, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getWebhookByIdLogsParams.shape, typeof getWebhookByIdLogsResponse.shape>;

export default withStandardDecorators(GetWebhookLogsTool);
