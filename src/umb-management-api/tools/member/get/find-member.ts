import { UmbracoManagementClient } from "@umb-management-client";
import { GetFilterMemberParams } from "@/umb-management-api/schemas/index.js";
import { getFilterMemberQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const FindMemberTool = {
  name: "find-member",
  description: `Finds members by various filter criteria`,
  schema: getFilterMemberQueryParams.shape,
  isReadOnly: true,
  slices: ['search'],
  handler: async (model: GetFilterMemberParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getFilterMember(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getFilterMemberQueryParams.shape>;

export default withStandardDecorators(FindMemberTool);
