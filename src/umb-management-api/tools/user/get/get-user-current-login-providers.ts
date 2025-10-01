import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";

const GetUserCurrentLoginProvidersTool = CreateUmbracoTool(
  "get-user-current-login-providers",
  "Gets the current user's available login providers",
  {}, // No parameters required
  async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserCurrentLoginProviders();

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

export default GetUserCurrentLoginProvidersTool;