import { UmbracoManagementClient } from "@umb-management-client";
import { GetMemberGroupParams } from "@/umb-management-api/schemas/index.js";
import { getMemberGroupQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetAllMemberGroupsTool = {
  name: "get-all-member-groups",
  description: `Gets all member groups with optional pagination`,
  schema: getMemberGroupQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (model: GetMemberGroupParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getMemberGroup(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getMemberGroupQueryParams.shape>;

export default withStandardDecorators(GetAllMemberGroupsTool);
