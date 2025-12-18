import { UmbracoManagementClient } from "@umb-management-client";
import { getUserByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetUserByIdTool = {
  name: "get-user-by-id",
  description: "Gets a user by their unique identifier",
  schema: getUserByIdParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getUserByIdParams.shape>;

export default withStandardDecorators(GetUserByIdTool);