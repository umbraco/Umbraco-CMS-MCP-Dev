import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";

const GetWebhookEventsTool = CreateUmbracoReadTool(
  "get-webhook-events",
  "Gets a list of available webhook events",
  {},
  async () => {
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
  }
);

export default GetWebhookEventsTool;
