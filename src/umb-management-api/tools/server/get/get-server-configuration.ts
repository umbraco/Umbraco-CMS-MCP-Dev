import { getServerConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetServerConfigurationTool = {
  name: "get-server-configuration",
  description: `Gets the server configuration settings.
  Returns an object containing:
  - allowPasswordReset: Whether password reset is allowed (boolean)
  - versionCheckPeriod: The period between version checks in minutes (number)
  - allowLocalLogin: Whether local login is allowed (boolean)

  Example response:
  {
    "allowPasswordReset": true,
    "versionCheckPeriod": 1440,
    "allowLocalLogin": true
  }`,
  inputSchema: {},
  outputSchema: getServerConfigurationResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['server-info'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getServerConfiguration(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getServerConfigurationResponse.shape>;

export default withStandardDecorators(GetServerConfigurationTool);
