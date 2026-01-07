import { GetWebhookParams } from "@/umb-management-api/schemas/index.js";
import { getWebhookQueryParams, getWebhookResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetWebhookTool = {
  name: "get-webhook",
  description: "Gets a paged list of webhooks",
  inputSchema: getWebhookQueryParams.shape,
  outputSchema: getWebhookResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async (params: GetWebhookParams) => {
    return executeGetApiCall((client) =>
      client.getWebhook(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getWebhookQueryParams.shape, typeof getWebhookResponse.shape>;

export default withStandardDecorators(GetWebhookTool);