import { UmbracoManagementClient } from "@umb-management-client";
import { UpdateWebhookRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putWebhookByIdBody,
  putWebhookByIdParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const updateWebhookSchema = {
  id: putWebhookByIdParams.shape.id,
  data: z.object(putWebhookByIdBody.shape),
};

const UpdateWebhookTool = {
  name: "update-webhook",
  description: "Updates a webhook by id",
  schema: updateWebhookSchema,
  isReadOnly: false,
  slices: ['update'],
  handler: async (model: { id: string; data: UpdateWebhookRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putWebhookById(model.id, model.data);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof updateWebhookSchema>;

export default withStandardDecorators(UpdateWebhookTool);
