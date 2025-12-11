import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";

const GetTemplateQuerySettingsTool = CreateUmbracoReadTool(
  "get-template-query-settings",
  "Returns schema for template queries: available document types, properties, and operators",
  {},
  async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTemplateQuerySettings();

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

export default GetTemplateQuerySettingsTool;