import { getDocumentByIdNotificationsParams, getDocumentByIdNotificationsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

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
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentByIdNotifications(id);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getDocumentByIdNotificationsParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentNotificationsTool);
