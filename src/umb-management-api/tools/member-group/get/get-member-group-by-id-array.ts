import { UmbracoManagementClient } from "@umb-management-client";
import {
  getItemMemberGroupQueryParams,
  getItemMemberGroupResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { GetItemMemberGroupParams } from "@/umb-management-api/schemas/index.js";

const GetMemberGroupByIdArrayTool = {
  name: "get-member-group-by-id-array",
  description: "Gets member groups by an array of IDs",
  schema: getItemMemberGroupQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (params: GetItemMemberGroupParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemMemberGroup(params);
    // Validate response shape
    getItemMemberGroupResponse.parse(response);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getItemMemberGroupQueryParams.shape>;

export default withStandardDecorators(GetMemberGroupByIdArrayTool);
