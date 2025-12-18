import { UmbracoManagementClient } from "@umb-management-client";
import { deleteMemberGroupByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteMemberGroupTool = {
  name: "delete-member-group",
  description: "Deletes a member group by Id",
  schema: deleteMemberGroupByIdParams.shape,
  isReadOnly: false,
  slices: ['delete'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.deleteMemberGroupById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof deleteMemberGroupByIdParams.shape>;

export default withStandardDecorators(DeleteMemberGroupTool);
