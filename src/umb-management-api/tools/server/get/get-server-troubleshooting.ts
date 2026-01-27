import { getServerTroubleshootingResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetServerTroubleshootingTool = {
  name: "get-server-troubleshooting",
  description: `Gets server troubleshooting information.
  Returns an array of diagnostic items, where each item contains:
  - name: The name/identifier of the diagnostic check (string)
  - data: The diagnostic data or result for that check (string)

  Example response:
  {
    "items": [
      {
        "name": "Server OS",
        "data": "Darwin 23.6.0 Darwin Kernel Version 23.6.0: Mon Jul 29 21:14:30 PDT 2024; root:xnu-10063.141.2~1/RELEASE_ARM64_T6000"
      },
      {
        "name": "Server Framework",
        "data": ".NET 9.0.0"
      },
      {
        "name": "Default Language",
        "data": "en-US"
      },
      {
        "name": "Umbraco Version",
        "data": "15.3.1"
      },
      {
        "name": "Current Culture",
        "data": "en-US"
      },
      {
        "name": "Current UI Culture",
        "data": "en-US"
      },
      {
        "name": "Current Webserver",
        "data": "Kestrel"
      },
      {
        "name": "Models Builder Mode",
        "data": "InMemoryAuto"
      },
      {
        "name": "Runtime Mode",
        "data": "BackofficeDevelopment"
      },
      {
        "name": "Debug Mode",
        "data": "True"
      },
      {
        "name": "Database Provider",
        "data": "Microsoft.Data.SqlClient"
      },
      {
        "name": "Current Server Role",
        "data": "Single"
      }
    ]
  }`,
  inputSchema: {},
  outputSchema: getServerTroubleshootingResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['server-info'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getServerTroubleshooting(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getServerTroubleshootingResponse.shape>;

export default withStandardDecorators(GetServerTroubleshootingTool);
