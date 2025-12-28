import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetTemplateConfigurationTool = {
  name: "get-template-configuration",
  description: "Gets template configuration settings including whether templates are disabled system-wide",
  schema: {},
  isReadOnly: true,
  slices: ['configuration'],
  handler: async () => {
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
  },
} satisfies ToolDefinition<{}>;

export default withStandardDecorators(GetTemplateConfigurationTool);