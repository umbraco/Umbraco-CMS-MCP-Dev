import { getRedirectManagementStatusResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetRedirectStatusTool = {
  name: "get-redirect-status",
  description: `Gets the current status of redirect management.
  Returns information about whether redirects are enabled and other status details.`,
  inputSchema: {},
  outputSchema: getRedirectManagementStatusResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getRedirectManagementStatus(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getRedirectManagementStatusResponse.shape>;

export default withStandardDecorators(GetRedirectStatusTool);
