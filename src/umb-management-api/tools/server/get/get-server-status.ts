import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

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
  schema: {},
  isReadOnly: true,
  slices: ['server-info'],
  handler: async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getServerStatus();

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

export default withStandardDecorators(GetServerStatusTool);
