import GetWebhookByIdTool from "./get/get-webhook-by-id.js";
import GetWebhookItemTool from "./get/get-webhook-by-id-array.js";
import GetWebhookTool from "./get/get-webhook.js";
import DeleteWebhookTool from "./delete/delete-webhook.js";
import UpdateWebhookTool from "./put/update-webhook.js";
import GetWebhookEventsTool from "./get/get-webhook-events.js";
import GetAllWebhookLogsTool from "./get/get-all-webhook-logs.js";
import CreateWebhookTool from "./post/create-webhook.js";
import GetWebhookLogsTool from "./get/get-webhook-logs-by-id.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const WebhookCollection: ToolCollectionExport = {
  metadata: {
    name: 'webhook',
    displayName: 'Webhooks',
    description: 'Webhook management and event handling',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any, any>[] = [];

    if (AuthorizationPolicies.TreeAccessWebhooks(user)) {
      tools.push(
        GetWebhookItemTool,
        CreateWebhookTool,
        GetWebhookTool,
        GetWebhookByIdTool,
        DeleteWebhookTool,
        UpdateWebhookTool,
        GetWebhookEventsTool,
        GetAllWebhookLogsTool,
        GetWebhookLogsTool
      );
    }

    return tools;
  }
};

// Backwards compatibility export
export const WebhookTools = (user: CurrentUserResponseModel) => {
  return WebhookCollection.tools(user);
};