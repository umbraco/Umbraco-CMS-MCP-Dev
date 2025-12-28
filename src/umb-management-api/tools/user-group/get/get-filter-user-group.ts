import { UmbracoManagementClient } from "@umb-management-client";
import { GetFilterUserGroupParams } from "@/umb-management-api/schemas/index.js";
import { getFilterUserGroupQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetFilterUserGroupTool = {
  name: "get-filter-user-group",
  description: "Gets filtered user groups",
  schema: getFilterUserGroupQueryParams.shape,
  isReadOnly: true,
  slices: ['search'],
  handler: async (model: GetFilterUserGroupParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getFilterUserGroup(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getFilterUserGroupQueryParams.shape>;

export default withStandardDecorators(GetFilterUserGroupTool);
