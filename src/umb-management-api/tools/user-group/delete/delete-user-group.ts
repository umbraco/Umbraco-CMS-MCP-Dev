import { UmbracoManagementClient } from "@umb-management-client";
import { deleteUserGroupByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteUserGroupTool = {
  name: "delete-user-group",
  description: "Deletes a user group by Id",
  schema: deleteUserGroupByIdParams.shape,
  isReadOnly: false,
  slices: ['delete'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteUserGroupById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof deleteUserGroupByIdParams.shape>;

export default withStandardDecorators(DeleteUserGroupTool);
