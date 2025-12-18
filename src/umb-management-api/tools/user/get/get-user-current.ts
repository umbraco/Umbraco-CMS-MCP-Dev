import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetUserCurrentTool = {
  name: "get-user-current",
  description: "Gets the current authenticated user's information",
  schema: undefined,
  isReadOnly: true,
  slices: ['current-user'],
  handler: async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserCurrent();

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

export default withStandardDecorators(GetUserCurrentTool);