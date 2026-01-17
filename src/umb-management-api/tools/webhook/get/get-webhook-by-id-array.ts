import { GetItemWebhookParams } from "@/umb-management-api/schemas/index.js";
import { getItemWebhookQueryParams, getItemWebhookResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Wrap array response in object for MCP compliance
const outputSchema = z.object({
  items: getItemWebhookResponse,
});

const GetWebhookItemTool = {
  name: "get-webhook-item",
  description: "Gets webhooks by IDs (or empty array if no IDs are provided)",
  inputSchema: getItemWebhookQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async (params: GetItemWebhookParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemWebhook(params, CAPTURE_RAW_HTTP_RESPONSE)
    );  
  }),
} satisfies ToolDefinition<typeof getItemWebhookQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetWebhookItemTool);
