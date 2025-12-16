import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreeDataTypeSiblingsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDataTypeSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDataTypeSiblingsTool = {
  name: "get-data-type-siblings",
  description: "Gets sibling data types or data type folders for a given descendant id",
  schema: getTreeDataTypeSiblingsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeDataTypeSiblingsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDataTypeSiblings(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeDataTypeSiblingsQueryParams.shape>;

export default withStandardDecorators(GetDataTypeSiblingsTool);
