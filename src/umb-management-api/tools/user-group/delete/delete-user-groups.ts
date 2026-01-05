import { DeleteUserGroupsRequestModel } from "@/umb-management-api/schemas/index.js";
import { deleteUserGroupBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
