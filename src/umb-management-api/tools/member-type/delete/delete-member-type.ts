import { UmbracoManagementClient } from "@umb-management-client";
import { deleteMemberTypeByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteMemberTypeTool = {
  name: "delete-member-type",
  description: "Deletes a member type by id",
  schema: deleteMemberTypeByIdParams.shape,
  isReadOnly: false,
  slices: ['delete'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteMemberTypeById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof deleteMemberTypeByIdParams.shape>;

export default withStandardDecorators(DeleteMemberTypeTool);
