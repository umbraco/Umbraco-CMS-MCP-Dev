import { UpdateTemplateRequestModel } from "@/umb-management-api/schemas/index.js";
import { putTemplateByIdBody, putTemplateByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const updateTemplateSchema = z.object({
  id: putTemplateByIdParams.shape.id,
  data: z.object(putTemplateByIdBody.shape),
});

const UpdateTemplateTool = {
  name: "update-template",
  description: "Updates a template by Id",
  inputSchema: updateTemplateSchema.shape,
  annotations: { idempotentHint: true },
  slices: ['update'],
  handler: (async (model: { id: string; data: UpdateTemplateRequestModel }) => {
    return executeVoidApiCall((client) =>
      client.putTemplateById(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof updateTemplateSchema.shape>;

export default withStandardDecorators(UpdateTemplateTool);
