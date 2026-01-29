import { getUserConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetUserConfigurationTool = {
  name: "get-user-configuration",
  description: "Gets user configuration settings including user invitation settings and password requirements",
  inputSchema: {},
  outputSchema: getUserConfigurationResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['configuration'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getUserConfiguration(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getUserConfigurationResponse.shape>;

export default withStandardDecorators(GetUserConfigurationTool);
