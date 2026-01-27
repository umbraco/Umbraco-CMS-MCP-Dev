import { UpdateMemberRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putMemberByIdBody,
  putMemberByIdParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = z.object({
  id: putMemberByIdParams.shape.id,
  data: z.object(putMemberByIdBody.shape),
});

const UpdateMemberTool = {
  name: "update-member",
  description: "Updates a member by Id",
  inputSchema: inputSchema.shape,
  annotations: { idempotentHint: true },
  slices: ['update'],
  handler: (async (model: { id: string; data: UpdateMemberRequestModel }) => {
    return executeVoidApiCall((client) =>
      client.putMemberById(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema.shape>;

export default withStandardDecorators(UpdateMemberTool);
