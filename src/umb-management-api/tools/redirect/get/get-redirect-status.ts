import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";

const GetRedirectStatusTool = CreateUmbracoReadTool(
  "get-redirect-status",
  `Gets the current status of redirect management.
  Returns information about whether redirects are enabled and other status details.
  
  Example response:
  {
    "isEnabled": true,
    "lastUpdated": "2024-03-20T10:00:00Z",
    "totalRedirects": 42,
    "status": "Active"
  }`,
  {},
  async () => {
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
  }
);

export default GetRedirectStatusTool;
