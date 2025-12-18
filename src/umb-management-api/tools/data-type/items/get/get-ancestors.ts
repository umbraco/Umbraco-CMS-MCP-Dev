import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreeDataTypeAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDataTypeAncestorsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDataTypeAncestorsTool = {
  name: "get-data-type-ancestors",
  description: "Gets the ancestors of a data type by Id",
  schema: getTreeDataTypeAncestorsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeDataTypeAncestorsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDataTypeAncestors(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeDataTypeAncestorsQueryParams.shape>;

export default withStandardDecorators(GetDataTypeAncestorsTool);
