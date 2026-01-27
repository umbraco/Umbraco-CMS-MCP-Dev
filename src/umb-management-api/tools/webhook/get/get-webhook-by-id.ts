import { getWebhookByIdParams, getWebhookByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetWebhookByIdTool = {
  name: "get-webhook-by-id",
  description: "Gets a webhook by id",
  inputSchema: getWebhookByIdParams.shape,
  outputSchema: getWebhookByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getWebhookById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getWebhookByIdParams.shape, typeof getWebhookByIdResponse.shape>;

export default withStandardDecorators(GetWebhookByIdTool);
