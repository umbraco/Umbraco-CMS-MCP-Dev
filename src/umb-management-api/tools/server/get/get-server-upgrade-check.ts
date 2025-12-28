import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetServerUpgradeCheckTool = {
  name: "get-server-upgrade-check",
  description: `Checks the server upgrade status and requirements.
  Returns an object containing:
  - type: The type of upgrade information (string)
  - comment: A description or message about the upgrade (string)
  - url: A URL with more information about the upgrade (string)

  Example response:
  {
    "type": "UpgradeAvailable",
    "comment": "A new version of Umbraco is available",
    "url": "https://our.umbraco.com/download/releases/15.3.2"
  }`,
  schema: {},
  isReadOnly: true,
  slices: ['server-info'],
  handler: async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getServerUpgradeCheck();

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

export default withStandardDecorators(GetServerUpgradeCheckTool);
