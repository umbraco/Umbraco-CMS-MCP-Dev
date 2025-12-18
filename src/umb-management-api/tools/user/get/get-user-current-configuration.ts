import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetUserCurrentConfigurationTool = {
  name: "get-user-current-configuration",
  description: "Gets current user configuration settings including login preferences and password requirements",
  schema: undefined,
  isReadOnly: true,
  slices: ['current-user'],
  handler: async () => {
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
  },
} satisfies ToolDefinition<undefined>;

export default withStandardDecorators(GetUserCurrentConfigurationTool);