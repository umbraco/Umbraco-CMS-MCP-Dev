import {
  putDocumentByIdNotificationsParams,
  putDocumentByIdNotificationsBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const inputSchema = {
  id: putDocumentByIdNotificationsParams.shape.id,
  data: z.object(putDocumentByIdNotificationsBody.shape),
};

const PutDocumentNotificationsTool = {
  name: "put-document-notifications",
  description: "Updates the notifications for a document by Id.",
  inputSchema: inputSchema,
  annotations: {
    idempotentHint: true,
  },
  slices: ['notifications'],
  handler: (async (model: { id: string; data: any }) => {
    return executeVoidApiCall((client) =>
      client.putDocumentByIdNotifications(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(PutDocumentNotificationsTool);
