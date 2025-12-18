import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreeMemberTypeRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeMemberTypeRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetMemberTypeRootTool = {
  name: "get-member-type-root",
  description: "Gets the root level of the member type tree",
  schema: getTreeMemberTypeRootQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeMemberTypeRootParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeMemberTypeRoot(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeMemberTypeRootQueryParams.shape>;

export default withStandardDecorators(GetMemberTypeRootTool);
