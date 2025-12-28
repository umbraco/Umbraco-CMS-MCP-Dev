import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetUserConfigurationTool = {
  name: "get-user-configuration",
  description: "Gets user configuration settings including user invitation settings and password requirements",
  schema: undefined,
  isReadOnly: true,
  slices: ['configuration'],
  handler: async () => {
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
  },
} satisfies ToolDefinition<undefined>;

export default withStandardDecorators(GetUserConfigurationTool);