import { GetWebhookParams } from "@/umb-management-api/schemas/index.js";
import { getWebhookQueryParams, getWebhookResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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