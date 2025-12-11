import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";

const GetServerConfigurationTool = CreateUmbracoReadTool(
  "get-server-configuration",
  `Gets the server configuration settings.
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
  {},
  async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getServerConfiguration();

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

export default GetServerConfigurationTool;
