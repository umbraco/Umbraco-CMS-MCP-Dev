import { getServerStatusResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetServerStatusTool = {
  name: "get-server-status",
  description: `Gets the current status of the Umbraco server.
  Returns the server status (serverStatus) which can be one of:
  - Unknown: Status cannot be determined
  - Boot: Server is starting up
  - Install: Server is in installation mode
  - Upgrade: Server is performing an upgrade
  - Run: Server is running normally
  - BootFailed: Server failed to start

  Example response:
  {
    "serverStatus": "Run"
  }`,
  inputSchema: {},
  outputSchema: getServerStatusResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['server-info'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getServerStatus(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getServerStatusResponse.shape>;

export default withStandardDecorators(GetServerStatusTool);
