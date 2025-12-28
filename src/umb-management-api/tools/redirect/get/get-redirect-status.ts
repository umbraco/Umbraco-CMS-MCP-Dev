import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetRedirectStatusTool = {
  name: "get-redirect-status",
  description: `Gets the current status of redirect management.
  Returns information about whether redirects are enabled and other status details.

  Example response:
  {
    "isEnabled": true,
    "lastUpdated": "2024-03-20T10:00:00Z",
    "totalRedirects": 42,
    "status": "Active"
  }`,
  schema: {},
  isReadOnly: true,
  slices: ['read'],
  handler: async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRedirectManagementStatus();

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

export default withStandardDecorators(GetRedirectStatusTool);
