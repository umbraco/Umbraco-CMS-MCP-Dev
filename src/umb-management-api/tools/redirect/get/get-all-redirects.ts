import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetAllRedirectsTool = {
  name: "get-all-redirects",
  description: `Gets all redirects from the Umbraco server.
  Returns a list of redirects with their details.

  Example response:
  {
    "items": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "sourceUrl": "/old-page",
        "destinationUrl": "/new-page",
        "statusCode": 301,
        "isEnabled": true,
        "createdAt": "2024-03-20T10:00:00Z",
        "updatedAt": "2024-03-20T10:00:00Z"
      }
    ],
    "total": 1
  }`,
  schema: {},
  isReadOnly: true,
  slices: ['list'],
  handler: async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRedirectManagement();

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

export default withStandardDecorators(GetAllRedirectsTool);
