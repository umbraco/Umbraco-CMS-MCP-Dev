import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";

const GetServerStatusTool = CreateUmbracoReadTool(
  "get-server-status",
  `Gets the current status of the Umbraco server.
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
  {},
  async () => {
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
  }
);

export default GetServerStatusTool;
