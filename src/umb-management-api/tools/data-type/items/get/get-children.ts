import { GetTreeDataTypeChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDataTypeChildrenQueryParams, getTreeDataTypeChildrenResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetOperation, FULL_RESPONSE_OPTIONS } from "@/helpers/mcp/tool-decorators.js";

const GetDataTypeChildrenTool = {
  name: "get-data-type-children",
  description: "Gets the children data types or data type folders by the parent id",
  inputSchema: getTreeDataTypeChildrenQueryParams.shape,
  outputSchema: getTreeDataTypeChildrenResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree'],
  handler: (async (params: GetTreeDataTypeChildrenParams) => {
    return executeGetOperation((client) =>
      client.getTreeDataTypeChildren(params, FULL_RESPONSE_OPTIONS)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDataTypeChildrenQueryParams.shape, typeof getTreeDataTypeChildrenResponse.shape>;

export default withStandardDecorators(GetDataTypeChildrenTool);
