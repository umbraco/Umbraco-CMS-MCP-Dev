import { UpdateMemberTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putMemberTypeByIdBody,
  putMemberTypeByIdParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
