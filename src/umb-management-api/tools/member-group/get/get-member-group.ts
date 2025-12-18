import { UmbracoManagementClient } from "@umb-management-client";
import { getMemberGroupByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetMemberGroupTool = {
  name: "get-member-group",
  description: "Gets a member group by Id",
  schema: getMemberGroupByIdParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMemberGroupById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getMemberGroupByIdParams.shape>;

export default withStandardDecorators(GetMemberGroupTool);
