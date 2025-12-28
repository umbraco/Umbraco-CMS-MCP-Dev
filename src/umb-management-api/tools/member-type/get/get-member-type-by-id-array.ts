import { UmbracoManagementClient } from "@umb-management-client";
import { getItemMemberTypeQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetMemberTypesByIdArrayTool = {
  name: "get-member-types-by-id-array",
  description: "Gets member types by IDs (or empty array if no IDs are provided)",
  schema: getItemMemberTypeQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (params: { id?: string[] }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemMemberType(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getItemMemberTypeQueryParams.shape>;

export default withStandardDecorators(GetMemberTypesByIdArrayTool);
