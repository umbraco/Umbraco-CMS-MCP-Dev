import { GetTreeDataTypeRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDataTypeRootQueryParams, getTreeDataTypeRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetOperation, FULL_RESPONSE_OPTIONS } from "@/helpers/mcp/tool-decorators.js";

const GetDataTypeRootTool = {
  name: "get-data-type-root",
  description: "Gets the root level of the data type and data type folders in the tree.",
  inputSchema: getTreeDataTypeRootQueryParams.shape,
  outputSchema: getTreeDataTypeRootResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree'],
  handler: (async (params: GetTreeDataTypeRootParams) => {
    return executeGetOperation((client) =>
      client.getTreeDataTypeRoot(params, FULL_RESPONSE_OPTIONS)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDataTypeRootQueryParams.shape, typeof getTreeDataTypeRootResponse.shape>;

export default withStandardDecorators(GetDataTypeRootTool);
