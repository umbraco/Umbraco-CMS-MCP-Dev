import { getWebhookEventsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetWebhookEventsTool = {
  name: "get-webhook-events",
  description: "Gets a list of available webhook events",
  inputSchema: {},
  outputSchema: getWebhookEventsResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getWebhookEvents(undefined, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getWebhookEventsResponse.shape>;

export default withStandardDecorators(GetWebhookEventsTool);
