import { UmbracoManagementClient } from "@umb-management-client";
import { getWebhookByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetWebhookByIdTool = {
  name: "get-webhook-by-id",
  description: "Gets a webhook by id",
  schema: getWebhookByIdParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getWebhookById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getWebhookByIdParams.shape>;

export default withStandardDecorators(GetWebhookByIdTool);
