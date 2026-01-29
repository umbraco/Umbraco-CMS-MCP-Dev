import { UpdateMemberTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putMemberTypeByIdBody,
  putMemberTypeByIdParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = z.object({
  id: putMemberTypeByIdParams.shape.id,
  data: z.object(putMemberTypeByIdBody.shape),
});

const UpdateMemberTypeTool = {
  name: "update-member-type",
  description: "Updates a member type by id",
  inputSchema: inputSchema.shape,
  annotations: { idempotentHint: true },
  slices: ['update'],
  handler: (async (model: { id: string; data: UpdateMemberTypeRequestModel }) => {
    return executeVoidApiCall((client) =>
      client.putMemberTypeById(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema.shape>;

export default withStandardDecorators(UpdateMemberTypeTool);
