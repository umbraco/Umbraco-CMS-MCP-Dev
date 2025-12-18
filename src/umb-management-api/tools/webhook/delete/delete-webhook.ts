import { UmbracoManagementClient } from "@umb-management-client";
import { deleteWebhookByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteWebhookTool = {
  name: "delete-webhook",
  description: "Deletes a webhook by id",
  schema: deleteWebhookByIdParams.shape,
  isReadOnly: false,
  slices: ['delete'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteWebhookById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof deleteWebhookByIdParams.shape>;

export default withStandardDecorators(DeleteWebhookTool);
