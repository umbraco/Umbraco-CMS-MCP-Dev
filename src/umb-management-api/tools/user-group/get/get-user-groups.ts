import { GetUserGroupParams } from "@/umb-management-api/schemas/index.js";
import { getUserGroupQueryParams, getUserGroupResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetUserGroupsTool = {
  name: "get-user-groups",
  description: "Gets all user groups",
  inputSchema: getUserGroupQueryParams.shape,
  outputSchema: getUserGroupResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async (model: GetUserGroupParams) => {
    return executeGetApiCall((client) =>
      client.getUserGroup(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getUserGroupQueryParams.shape, typeof getUserGroupResponse.shape>;

export default withStandardDecorators(GetUserGroupsTool);
