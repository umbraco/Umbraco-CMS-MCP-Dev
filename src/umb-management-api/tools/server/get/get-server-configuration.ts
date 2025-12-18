import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

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
  schema: {},
  isReadOnly: true,
  slices: ['server-info'],
  handler: async () => {
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
  },
} satisfies ToolDefinition<{}>;

export default withStandardDecorators(GetServerConfigurationTool);
