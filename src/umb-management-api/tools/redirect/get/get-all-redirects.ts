import { getRedirectManagementResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetAllRedirectsTool = {
  name: "get-all-redirects",
  description: `Gets all redirects from the Umbraco server.
  Returns a list of redirects with their details.`,
  inputSchema: {},
  outputSchema: getRedirectManagementResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getRedirectManagement(undefined, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getRedirectManagementResponse.shape>;

export default withStandardDecorators(GetAllRedirectsTool);
