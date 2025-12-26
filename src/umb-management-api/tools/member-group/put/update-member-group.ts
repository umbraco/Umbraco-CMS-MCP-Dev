import { UpdateMemberGroupRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putMemberGroupByIdBody,
  putMemberGroupByIdParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const inputSchema = {
  id: putMemberGroupByIdParams.shape.id,
  data: z.object(putMemberGroupByIdBody.shape),
};

const UpdateMemberGroupTool = {
  name: "update-member-group",
  description: "Updates a member group by Id",
  inputSchema: inputSchema,
  annotations: {
    idempotentHint: true,
  },
  slices: ['update'],
  handler: (async (model: { id: string; data: UpdateMemberGroupRequestModel }) => {
    return executeVoidApiCall((client) =>
      client.putMemberGroupById(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(UpdateMemberGroupTool);
