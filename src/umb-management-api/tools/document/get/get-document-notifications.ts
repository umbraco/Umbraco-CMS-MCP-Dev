import { UmbracoManagementClient } from "@umb-management-client";
import { getDocumentByIdNotificationsParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDocumentNotificationsTool = {
  name: "get-document-notifications",
  description: "Gets the notifications for a document by Id.",
  schema: getDocumentByIdNotificationsParams.shape,
  isReadOnly: true,
  slices: ['notifications'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentByIdNotifications(id);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getDocumentByIdNotificationsParams.shape>;

export default withStandardDecorators(GetDocumentNotificationsTool);
