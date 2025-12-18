import { UmbracoManagementClient } from "@umb-management-client";
import { getWebhookByIdLogsParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetWebhookLogsTool = {
  name: "get-webhook-logs",
  description: "Gets logs for a specific webhook",
  schema: getWebhookByIdLogsParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getWebhookByIdLogs(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getWebhookByIdLogsParams.shape>;

export default withStandardDecorators(GetWebhookLogsTool);
