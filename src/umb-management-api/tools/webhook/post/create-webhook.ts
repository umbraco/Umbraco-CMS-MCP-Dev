import { UmbracoManagementClient } from "@umb-management-client";
import { CreateWebhookRequestModel } from "@/umb-management-api/schemas/index.js";
import { postWebhookBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const CreateWebhookTool = {
  name: "create-webhook",
  description: `Creates a new webhook
  Must contain at least one event from the events listed at /umbraco/management/api/v1/webhook/events endpoint.
  Cannot mix different event types in the same webhook.`,
  schema: postWebhookBody.shape,
  isReadOnly: false,
  slices: ['create'],
  handler: async (model: CreateWebhookRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.postWebhook(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof postWebhookBody.shape>;

export default withStandardDecorators(CreateWebhookTool);
