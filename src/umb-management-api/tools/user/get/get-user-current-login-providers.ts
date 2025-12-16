import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetUserCurrentLoginProvidersTool = {
  name: "get-user-current-login-providers",
  description: "Gets the current user's available login providers",
  schema: undefined,
  isReadOnly: true,
  slices: ['current-user'],
  handler: async () => {
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
  },
} satisfies ToolDefinition<undefined>;

export default withStandardDecorators(GetUserCurrentLoginProvidersTool);