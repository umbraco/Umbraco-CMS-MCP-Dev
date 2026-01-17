import { UpdateWebhookRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putWebhookByIdBody,
  putWebhookByIdParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const updateWebhookSchema = z.object({
  id: putWebhookByIdParams.shape.id,
  data: z.object(putWebhookByIdBody.shape),
});

const UpdateWebhookTool = {
  name: "update-webhook",
  description: "Updates a webhook by id",
  inputSchema: updateWebhookSchema.shape,
  annotations: { idempotentHint: true },
  slices: ['update'],
  handler: (async (model: { id: string; data: UpdateWebhookRequestModel }) => {
    return executeVoidApiCall((client) =>
      client.putWebhookById(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof updateWebhookSchema.shape>;

export default withStandardDecorators(UpdateWebhookTool);
