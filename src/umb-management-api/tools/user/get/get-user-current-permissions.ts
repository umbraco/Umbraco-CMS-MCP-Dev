import { GetUserCurrentPermissionsParams } from "@/umb-management-api/schemas/index.js";
import {
  getUserCurrentPermissionsQueryParams,
  getUserCurrentPermissionsResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetUserCurrentPermissionsTool = {
  name: "get-user-current-permissions",
  description: "Gets the current user's permissions for the specified entity",
  inputSchema: getUserCurrentPermissionsQueryParams.shape,
  outputSchema: getUserCurrentPermissionsResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['permissions'],
  handler: (async (params: GetUserCurrentPermissionsParams) => {
    return executeGetApiCall((client) =>
      client.getUserCurrentPermissions(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getUserCurrentPermissionsQueryParams.shape, typeof getUserCurrentPermissionsResponse.shape>;

export default withStandardDecorators(GetUserCurrentPermissionsTool);
