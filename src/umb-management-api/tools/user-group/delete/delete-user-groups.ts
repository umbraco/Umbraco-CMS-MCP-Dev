import { UmbracoManagementClient } from "@umb-management-client";
import { DeleteUserGroupsRequestModel } from "@/umb-management-api/schemas/index.js";
import { deleteUserGroupBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteUserGroupsTool = {
  name: "delete-user-groups",
  description: "Deletes all user groups",
  schema: deleteUserGroupBody.shape,
  isReadOnly: false,
  slices: ['delete'],
  handler: async (model: DeleteUserGroupsRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteUserGroup(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof deleteUserGroupBody.shape>;

export default withStandardDecorators(DeleteUserGroupsTool);
