import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreeDataTypeRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDataTypeRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDataTypeRootTool = {
  name: "get-data-type-root",
  description: "Gets the root level of the data type and data type folders in the tree.",
  schema: getTreeDataTypeRootQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeDataTypeRootParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDataTypeRoot(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeDataTypeRootQueryParams.shape>;

export default withStandardDecorators(GetDataTypeRootTool);
