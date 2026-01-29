import { UpdateUserGroupRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putUserGroupByIdBody,
  putUserGroupByIdParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const updateUserGroupSchema = z.object({
  id: putUserGroupByIdParams.shape.id,
  data: z.object(putUserGroupByIdBody.shape),
});

const UpdateUserGroupTool = {
  name: "update-user-group",
  description: "Updates a user group by Id",
  inputSchema: updateUserGroupSchema.shape,
  annotations: { idempotentHint: true },
  slices: ['update'],
  handler: (async (model: { id: string; data: UpdateUserGroupRequestModel }) => {
    return executeVoidApiCall((client) =>
      client.putUserGroupById(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof updateUserGroupSchema.shape>;

export default withStandardDecorators(UpdateUserGroupTool);
