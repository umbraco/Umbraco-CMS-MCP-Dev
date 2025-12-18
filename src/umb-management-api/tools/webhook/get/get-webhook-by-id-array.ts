import { UmbracoManagementClient } from "@umb-management-client";
import { getItemWebhookQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetWebhookItemTool = {
  name: "get-webhook-item",
  description: "Gets webhooks by IDs (or empty array if no IDs are provided)",
  schema: getItemWebhookQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (params: { id?: string[] }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemWebhook(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getItemWebhookQueryParams.shape>;

export default withStandardDecorators(GetWebhookItemTool);
