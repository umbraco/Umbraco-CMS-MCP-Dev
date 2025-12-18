import { UmbracoManagementClient } from "@umb-management-client";
import { getWebhookQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetWebhookTool = {
  name: "get-webhook",
  description: "Gets a paged list of webhooks",
  schema: getWebhookQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (params: { skip?: number; take?: number }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getWebhook(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getWebhookQueryParams.shape>;

export default withStandardDecorators(GetWebhookTool);