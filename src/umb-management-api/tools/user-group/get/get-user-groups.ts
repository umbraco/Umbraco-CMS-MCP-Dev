import { GetUserGroupParams } from "@/umb-management-api/schemas/index.js";
import { getUserGroupQueryParams, getUserGroupResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
