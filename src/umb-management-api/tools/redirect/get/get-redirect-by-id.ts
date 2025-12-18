import { UmbracoManagementClient } from "@umb-management-client";
import { getRedirectManagementByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetRedirectByIdTool = {
  name: "get-redirect-by-id",
  description: `Gets a specific redirect by its ID.
  Parameters:
  - id: The unique identifier of the redirect (string)

  Returns the redirect details.

  Example response:
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "sourceUrl": "/old-page",
    "destinationUrl": "/new-page",
    "statusCode": 301,
    "isEnabled": true,
    "createdAt": "2024-03-20T10:00:00Z",
    "updatedAt": "2024-03-20T10:00:00Z"
  }`,
  schema: getRedirectManagementByIdParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRedirectManagementById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getRedirectManagementByIdParams.shape>;

export default withStandardDecorators(GetRedirectByIdTool);
