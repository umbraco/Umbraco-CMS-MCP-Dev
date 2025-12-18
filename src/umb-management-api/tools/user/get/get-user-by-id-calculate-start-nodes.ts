import { UmbracoManagementClient } from "@umb-management-client";
import { getUserByIdCalculateStartNodesParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetUserByIdCalculateStartNodesTool = {
  name: "get-user-by-id-calculate-start-nodes",
  description: "Calculates start nodes for a user by their ID based on permissions",
  schema: getUserByIdCalculateStartNodesParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserByIdCalculateStartNodes(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getUserByIdCalculateStartNodesParams.shape>;

export default withStandardDecorators(GetUserByIdCalculateStartNodesTool);