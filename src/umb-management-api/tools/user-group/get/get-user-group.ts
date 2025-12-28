import { UmbracoManagementClient } from "@umb-management-client";
import { getUserGroupByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetUserGroupTool = {
  name: "get-user-group",
  description: "Gets a user group by Id",
  schema: getUserGroupByIdParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserGroupById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getUserGroupByIdParams.shape>;

export default withStandardDecorators(GetUserGroupTool);
