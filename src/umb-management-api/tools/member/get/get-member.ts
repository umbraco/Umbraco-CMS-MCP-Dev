import { UmbracoManagementClient } from "@umb-management-client";
import { getMemberByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetMemberTool = {
  name: "get-member",
  description: "Gets a member by Id",
  schema: getMemberByIdParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMemberById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getMemberByIdParams.shape>;

export default withStandardDecorators(GetMemberTool);
