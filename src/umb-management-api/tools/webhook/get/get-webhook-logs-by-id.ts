import { getWebhookByIdLogsParams, getWebhookByIdLogsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
