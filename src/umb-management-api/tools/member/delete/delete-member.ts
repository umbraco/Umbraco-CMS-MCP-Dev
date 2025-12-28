import { UmbracoManagementClient } from "@umb-management-client";
import { deleteMemberByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteMemberTool = {
  name: "delete-member",
  description: "Deletes a member by Id",
  schema: deleteMemberByIdParams.shape,
  isReadOnly: false,
  slices: ['delete'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteMemberById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof deleteMemberByIdParams.shape>;

export default withStandardDecorators(DeleteMemberTool);
