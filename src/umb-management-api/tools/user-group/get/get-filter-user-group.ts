import { GetFilterUserGroupParams } from "@/umb-management-api/schemas/index.js";
import { getFilterUserGroupQueryParams, getFilterUserGroupResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
