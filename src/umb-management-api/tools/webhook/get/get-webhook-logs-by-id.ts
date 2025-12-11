import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getWebhookByIdLogsParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetWebhookLogsTool = CreateUmbracoReadTool(
  "get-webhook-logs",
  "Gets logs for a specific webhook",
  getWebhookByIdLogsParams.shape,
  async ({ id }: { id: string }) => {
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
  }
);

export default GetWebhookLogsTool;
