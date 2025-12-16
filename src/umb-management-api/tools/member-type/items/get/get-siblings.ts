import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeMemberTypeSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetMemberTypeSiblingsTool = {
  name: "get-member-type-siblings",
  description: "Gets sibling member types or member type folders for a given descendant id",
  schema: getTreeMemberTypeSiblingsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: any) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeMemberTypeSiblings(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeMemberTypeSiblingsQueryParams.shape>;

export default withStandardDecorators(GetMemberTypeSiblingsTool);
