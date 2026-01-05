import { GetItemWebhookParams } from "@/umb-management-api/schemas/index.js";
import { getItemWebhookQueryParams, getItemWebhookResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

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
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemWebhook(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getItemWebhookQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetWebhookItemTool);
