import { getWebhookEventsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
