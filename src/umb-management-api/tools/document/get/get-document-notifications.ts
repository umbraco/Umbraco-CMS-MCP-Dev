import { getDocumentByIdNotificationsParams, getDocumentByIdNotificationsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

const outputSchema = z.object({
  items: getDocumentByIdNotificationsResponse,
});

const GetDocumentNotificationsTool = {
  name: "get-document-notifications",
  description: "Gets the notifications for a document by Id.",
  inputSchema: getDocumentByIdNotificationsParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['notifications'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetItemsApiCall((client) =>
      client.getDocumentByIdNotifications(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentByIdNotificationsParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentNotificationsTool);
