import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetTemplateQuerySettingsTool = {
  name: "get-template-query-settings",
  description: "Returns schema for template queries: available document types, properties, and operators",
  schema: {},
  isReadOnly: true,
  slices: ['read'],
  handler: async () => {
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
  },
} satisfies ToolDefinition<{}>;

export default withStandardDecorators(GetTemplateQuerySettingsTool);