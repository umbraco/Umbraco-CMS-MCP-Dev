import { getUserCurrentResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetUserCurrentTool = {
  name: "get-user-current",
  description: "Gets the current authenticated user's information",
  inputSchema: {},
  outputSchema: getUserCurrentResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['current-user'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getUserCurrent(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getUserCurrentResponse.shape>;

export default withStandardDecorators(GetUserCurrentTool);
