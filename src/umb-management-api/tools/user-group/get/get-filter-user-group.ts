import { GetFilterUserGroupParams } from "@/umb-management-api/schemas/index.js";
import { getFilterUserGroupQueryParams, getFilterUserGroupResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetFilterUserGroupTool = {
  name: "get-filter-user-group",
  description: "Gets filtered user groups",
  inputSchema: getFilterUserGroupQueryParams.shape,
  outputSchema: getFilterUserGroupResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['search'],
  handler: (async (model: GetFilterUserGroupParams) => {
    return executeGetApiCall((client) =>
      client.getFilterUserGroup(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getFilterUserGroupQueryParams.shape, typeof getFilterUserGroupResponse.shape>;

export default withStandardDecorators(GetFilterUserGroupTool);
