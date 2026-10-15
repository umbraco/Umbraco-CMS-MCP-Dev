import { getWebhookByIdLogsParams, getWebhookByIdLogsQueryParams, getWebhookByIdLogsResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = z.object({
  ...getWebhookByIdLogsParams.shape,
  ...getWebhookByIdLogsQueryParams.shape,
});

const GetWebhookLogsTool = {
  name: "get-webhook-logs",
  description: `Gets logs for a specific webhook.

  Results are paginated (100 per page by default). Check the returned "total" against the number of
  "items" returned - if total is greater, use skip/take to page through the remaining logs.`,
  inputSchema: inputSchema.shape,
  outputSchema: getWebhookByIdLogsResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id, skip, take }: z.infer<typeof inputSchema>) => {
    return executeGetApiCall((client) =>
      client.getWebhookByIdLogs(id, { skip, take }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema.shape, typeof getWebhookByIdLogsResponse.shape>;

export default withStandardDecorators(GetWebhookLogsTool);
