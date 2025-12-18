import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreeDataTypeChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDataTypeChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDataTypeChildrenTool = {
  name: "get-data-type-children",
  description: "Gets the children data types or data type folders by the parent id",
  schema: getTreeDataTypeChildrenQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeDataTypeChildrenParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDataTypeChildren(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeDataTypeChildrenQueryParams.shape>;

export default withStandardDecorators(GetDataTypeChildrenTool);
