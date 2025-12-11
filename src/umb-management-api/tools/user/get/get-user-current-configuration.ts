import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { z } from "zod";

const GetUserCurrentConfigurationTool = CreateUmbracoReadTool(
  "get-user-current-configuration",
  "Gets current user configuration settings including login preferences and password requirements",
  {},
  async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserCurrentConfiguration();

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }
);

export default GetUserCurrentConfigurationTool;