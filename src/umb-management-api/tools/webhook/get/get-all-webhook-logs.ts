import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getWebhookLogsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetAllWebhookLogsTool = CreateUmbracoReadTool(
  "get-all-webhook-logs",
  "Gets logs for all webhooks",
  getWebhookLogsQueryParams.shape,
  async (params: { skip?: number; take?: number }) => {
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
  }
);

export default GetAllWebhookLogsTool;
