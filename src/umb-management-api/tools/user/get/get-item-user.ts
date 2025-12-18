import { UmbracoManagementClient } from "@umb-management-client";
import { getItemUserQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetItemUserParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetItemUserTool = {
  name: "get-item-user",
  description: "Gets user items for selection lists and pickers",
  schema: getItemUserQueryParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async (params: GetItemUserParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemUser(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getItemUserQueryParams.shape>;

export default withStandardDecorators(GetItemUserTool);