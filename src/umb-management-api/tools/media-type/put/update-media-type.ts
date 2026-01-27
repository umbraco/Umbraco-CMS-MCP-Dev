import { UpdateMediaTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putMediaTypeByIdParams,
  putMediaTypeByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = z.object({
  id: putMediaTypeByIdParams.shape.id,
  data: z.object(putMediaTypeByIdBody.shape),
});

const UpdateMediaTypeTool = {
  name: "update-media-type",
  description: "Updates a media type by Id",
  inputSchema: inputSchema.shape,
  annotations: { idempotentHint: true },
  slices: ['update'],
  handler: (async (model: { id: string; data: UpdateMediaTypeRequestModel }) => {
    return executeVoidApiCall((client) =>
      client.putMediaTypeById(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema.shape>;

export default withStandardDecorators(UpdateMediaTypeTool);
