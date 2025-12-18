import { UmbracoManagementClient } from "@umb-management-client";
import { GetUserGroupParams } from "@/umb-management-api/schemas/index.js";
import { getUserGroupQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetUserGroupsTool = {
  name: "get-user-groups",
  description: "Gets all user groups",
  schema: getUserGroupQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (model: GetUserGroupParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserGroup(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getUserGroupQueryParams.shape>;

export default withStandardDecorators(GetUserGroupsTool);
