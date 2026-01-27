import { DeleteUserGroupsRequestModel } from "@/umb-management-api/schemas/index.js";
import { deleteUserGroupBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const DeleteUserGroupsTool = {
  name: "delete-user-groups",
  description: "Deletes all user groups",
  inputSchema: deleteUserGroupBody.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete'],
  handler: (async (model: DeleteUserGroupsRequestModel) => {
    return executeVoidApiCall((client) =>
      client.deleteUserGroup(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteUserGroupBody.shape>;

export default withStandardDecorators(DeleteUserGroupsTool);
