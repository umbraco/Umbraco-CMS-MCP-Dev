import { UmbracoManagementClient } from "@umb-management-client";
import { getMemberTypeByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetMemberTypeTool = {
  name: "get-member-type",
  description: "Gets a member type by Id",
  schema: getMemberTypeByIdParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMemberTypeById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getMemberTypeByIdParams.shape>;

export default withStandardDecorators(GetMemberTypeTool);
