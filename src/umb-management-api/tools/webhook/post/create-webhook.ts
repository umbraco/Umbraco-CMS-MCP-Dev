import { UmbracoManagementClient } from "@umb-management-client";
import { CreateWebhookRequestModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { postWebhookBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { AxiosResponse } from "axios";
import {
  type ToolDefinition,
  createToolResult,
  createToolResultError,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

export const createWebhookOutputSchema = z.object({
  message: z.string(),
  id: z.string().uuid()
});

const CreateWebhookTool = {
  name: "create-webhook",
  description: `Creates a new webhook
  Must contain at least one event from the events listed at /umbraco/management/api/v1/webhook/events endpoint.
  Cannot mix different event types in the same webhook.`,
  inputSchema: postWebhookBody.shape,
  outputSchema: createWebhookOutputSchema.shape,
  slices: ['create'],
  handler: (async (model: CreateWebhookRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postWebhook(model, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      // Extract ID from Location header
      const locationHeader = response.headers['location'] || response.headers['Location'];
      let createdId = '';
      if (locationHeader) {
        // Location header format: /umbraco/management/api/v1/webhook/{id}
        const idMatch = locationHeader.match(/webhook\/([a-f0-9-]+)$/i);
        if (idMatch) {
          createdId = idMatch[1];
        }
      }
      return createToolResult({
        message: "Webhook created successfully",
        id: createdId
      });
    } else {
      const errorData: ProblemDetails = response.data || {
        status: response.status,
        detail: response.statusText,
      };
      return createToolResultError(errorData);
    }
  }),
} satisfies ToolDefinition<typeof postWebhookBody.shape, typeof createWebhookOutputSchema.shape>;

export default withStandardDecorators(CreateWebhookTool);
