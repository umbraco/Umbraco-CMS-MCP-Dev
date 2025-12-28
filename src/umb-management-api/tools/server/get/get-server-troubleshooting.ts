import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

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
  schema: {},
  isReadOnly: true,
  slices: ['server-info'],
  handler: async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getServerTroubleshooting();

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<{}>;

export default withStandardDecorators(GetServerTroubleshootingTool);
