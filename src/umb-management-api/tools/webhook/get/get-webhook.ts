import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getWebhookQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetWebhookTool = CreateUmbracoReadTool(
  "get-webhook",
  "Gets a paged list of webhooks",
  getWebhookQueryParams.shape,
  async (params: { skip?: number; take?: number }) => {
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
  }
);

export default GetWebhookTool;