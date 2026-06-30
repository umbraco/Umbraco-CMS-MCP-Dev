import { UpdateCurrentUserRequestModel } from "@/umb-management-api/schemas/updateCurrentUserRequestModel.js";
import { putUserCurrentProfileBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const UpdateUserCurrentProfileTool = {
  name: "update-user-current-profile",
  description: "Updates the profile of the current authenticated user (e.g. the preferred UI language)",
  inputSchema: putUserCurrentProfileBody.shape,
  annotations: {
    idempotentHint: true,
  },
  slices: ['current-user'],
  handler: (async (model: UpdateCurrentUserRequestModel) => {
    return executeVoidApiCall((client) =>
      client.putUserCurrentProfile(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof putUserCurrentProfileBody.shape>;

export default withStandardDecorators(UpdateUserCurrentProfileTool);
