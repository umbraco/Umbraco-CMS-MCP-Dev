import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { UpdateWebhookRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putWebhookByIdBody,
  putWebhookByIdParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const UpdateWebhookTool = CreateUmbracoWriteTool(
  "update-webhook",
  "Updates a webhook by id",
  {
    id: putWebhookByIdParams.shape.id,
    data: z.object(putWebhookByIdBody.shape),
  },
  async (model: { id: string; data: UpdateWebhookRequestModel }) => {
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
  }
);

export default UpdateWebhookTool;
