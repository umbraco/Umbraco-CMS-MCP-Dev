import { GetUserCurrentPermissionsMediaParams } from "@/umb-management-api/schemas/index.js";
import {
  getUserCurrentPermissionsMediaQueryParams,
  getUserCurrentPermissionsMediaResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetUserCurrentPermissionsMediaTool = {
  name: "get-user-current-permissions-media",
  description: "Gets the current user's media permissions for specific media items",
  inputSchema: getUserCurrentPermissionsMediaQueryParams.shape,
  outputSchema: getUserCurrentPermissionsMediaResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['permissions'],
  handler: (async (params: GetUserCurrentPermissionsMediaParams) => {
    return executeGetApiCall((client) =>
      client.getUserCurrentPermissionsMedia(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getUserCurrentPermissionsMediaQueryParams.shape, typeof getUserCurrentPermissionsMediaResponse.shape>;

export default withStandardDecorators(GetUserCurrentPermissionsMediaTool);
