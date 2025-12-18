import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeMemberGroupRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { GetTreeMemberGroupRootParams } from "@/umb-management-api/schemas/index.js";

const GetMemberGroupRootTool = {
  name: "get-member-group-root",
  description: "Gets the root level of the member group tree",
  schema: getTreeMemberGroupRootQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeMemberGroupRootParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeMemberGroupRoot(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeMemberGroupRootQueryParams.shape>;

export default withStandardDecorators(GetMemberGroupRootTool);
