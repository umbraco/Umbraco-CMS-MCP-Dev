import { getServerInformationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetServerInformationTool = {
  name: "get-server-information",
  description: `Gets information about the Umbraco server.
  Returns an object containing:
  - version: The Umbraco version (string)
  - assemblyVersion: The assembly version (string)
  - baseUtcOffset: The server's UTC offset (string)
  - runtimeMode: The server's runtime mode, one of: 'BackofficeDevelopment', 'Development', 'Production' (string)

  Example response:
  {
    "version": "15.3.1",
    "assemblyVersion": "15.3.1.0",
    "baseUtcOffset": "-07:00:00",
    "runtimeMode": "BackofficeDevelopment"
  }`,
  inputSchema: {},
  outputSchema: getServerInformationResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['server-info'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getServerInformation(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getServerInformationResponse.shape>;

export default withStandardDecorators(GetServerInformationTool);
