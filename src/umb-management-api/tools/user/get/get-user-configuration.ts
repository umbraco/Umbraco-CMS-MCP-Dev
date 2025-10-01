import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { z } from "zod";

const GetUserConfigurationTool = CreateUmbracoTool(
  "get-user-configuration",
  "Gets user configuration settings including user invitation settings and password requirements",
  {},
  async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserConfiguration();

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

export default GetUserConfigurationTool;