import { getUserCurrentConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetUserCurrentConfigurationTool = {
  name: "get-user-current-configuration",
  description: "Gets current user configuration settings including login preferences and password requirements",
  inputSchema: {},
  outputSchema: getUserCurrentConfigurationResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['current-user'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getUserCurrentConfiguration(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getUserCurrentConfigurationResponse.shape>;

export default withStandardDecorators(GetUserCurrentConfigurationTool);
