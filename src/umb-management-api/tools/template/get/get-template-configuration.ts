import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { z } from "zod";

const GetTemplateConfigurationTool = CreateUmbracoTool(
  "get-template-configuration",
  "Gets template configuration settings including whether templates are disabled system-wide",
  {},
  async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTemplateConfiguration();

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

export default GetTemplateConfigurationTool;