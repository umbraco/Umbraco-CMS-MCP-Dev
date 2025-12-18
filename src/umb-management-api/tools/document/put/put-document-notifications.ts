import { UmbracoManagementClient } from "@umb-management-client";
import {
  putDocumentByIdNotificationsParams,
  putDocumentByIdNotificationsBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const putDocumentNotificationsSchema = {
  id: putDocumentByIdNotificationsParams.shape.id,
  data: z.object(putDocumentByIdNotificationsBody.shape),
};

const PutDocumentNotificationsTool = {
  name: "put-document-notifications",
  description: "Updates the notifications for a document by Id.",
  schema: putDocumentNotificationsSchema,
  isReadOnly: false,
  slices: ['notifications'],
  handler: async (model: { id: string; data: any }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDocumentByIdNotifications(
      model.id,
      model.data
    );
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof putDocumentNotificationsSchema>;

export default withStandardDecorators(PutDocumentNotificationsTool);
