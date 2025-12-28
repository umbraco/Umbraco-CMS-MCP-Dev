import { UmbracoManagementClient } from "@umb-management-client";
import { getUserQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetUserParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetUserTool = {
  name: "get-user",
  description: "Lists users with pagination and filtering options",
  schema: getUserQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (params: GetUserParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUser(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getUserQueryParams.shape>;

export default withStandardDecorators(GetUserTool);