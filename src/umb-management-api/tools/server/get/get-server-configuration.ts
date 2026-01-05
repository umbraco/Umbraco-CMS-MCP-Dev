import { getServerConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
