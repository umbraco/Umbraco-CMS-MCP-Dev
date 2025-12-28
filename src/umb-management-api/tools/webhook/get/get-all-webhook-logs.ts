import { UmbracoManagementClient } from "@umb-management-client";
import { getWebhookLogsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetAllWebhookLogsTool = {
  name: "get-all-webhook-logs",
  description: "Gets logs for all webhooks",
  schema: getWebhookLogsQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (params: { skip?: number; take?: number }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getWebhookLogs(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getWebhookLogsQueryParams.shape>;

export default withStandardDecorators(GetAllWebhookLogsTool);
