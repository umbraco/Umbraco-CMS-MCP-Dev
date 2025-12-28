import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetWebhookEventsTool = {
  name: "get-webhook-events",
  description: "Gets a list of available webhook events",
  schema: {},
  isReadOnly: true,
  slices: ['list'],
  handler: async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getWebhookEvents();

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<{}>;

export default withStandardDecorators(GetWebhookEventsTool);
