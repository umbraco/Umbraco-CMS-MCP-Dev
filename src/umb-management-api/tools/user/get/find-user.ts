import { UmbracoManagementClient } from "@umb-management-client";
import { getFilterUserQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetFilterUserParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const FindUserTool = {
  name: "find-user",
  description: "Finds users by filtering with name, email, or other criteria",
  schema: getFilterUserQueryParams.shape,
  isReadOnly: true,
  slices: ['search'],
  handler: async (params: GetFilterUserParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getFilterUser(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getFilterUserQueryParams.shape>;

export default withStandardDecorators(FindUserTool);