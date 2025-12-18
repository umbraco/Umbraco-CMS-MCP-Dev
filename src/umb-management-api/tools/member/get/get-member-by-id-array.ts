import { UmbracoManagementClient } from "@umb-management-client";
import { getItemMemberQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetItemMemberParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetMembersByIdArrayTool = {
  name: "get-members-by-id-array",
  description: "Gets members by IDs (or empty array if no IDs are provided)",
  schema: getItemMemberQueryParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async (params: GetItemMemberParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemMember(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getItemMemberQueryParams.shape>;

export default withStandardDecorators(GetMembersByIdArrayTool);
