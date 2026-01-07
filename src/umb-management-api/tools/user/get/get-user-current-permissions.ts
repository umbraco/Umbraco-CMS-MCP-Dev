import { GetUserCurrentPermissionsParams } from "@/umb-management-api/schemas/index.js";
import {
  getUserCurrentPermissionsQueryParams,
  getUserCurrentPermissionsResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
