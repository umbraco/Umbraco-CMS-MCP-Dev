import { UmbracoManagementClient } from "@umb-management-client";
import { GetItemUserGroupParams } from "@/umb-management-api/schemas/index.js";
import {
  getItemUserGroupQueryParams,
  getItemUserGroupResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetUserGroupByIdArrayTool = {
  name: "get-user-group-by-id-array",
  description: "Gets user groups by an array of IDs",
  schema: getItemUserGroupQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (params: GetItemUserGroupParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemUserGroup(params);
    // Validate response shape
    getItemUserGroupResponse.parse(response);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getItemUserGroupQueryParams.shape>;

export default withStandardDecorators(GetUserGroupByIdArrayTool);
