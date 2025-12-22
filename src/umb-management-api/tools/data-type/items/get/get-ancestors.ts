import { GetTreeDataTypeAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDataTypeAncestorsQueryParams, getTreeDataTypeAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetOperation, FULL_RESPONSE_OPTIONS } from "@/helpers/mcp/tool-decorators.js";

const GetDataTypeAncestorsTool = {
  name: "get-data-type-ancestors",
  description: "Gets the ancestors of a data type by Id",
  inputSchema: getTreeDataTypeAncestorsQueryParams.shape,
  outputSchema: getTreeDataTypeAncestorsResponse,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree'],
  handler: (async (params: GetTreeDataTypeAncestorsParams) => {
    return executeGetOperation((client) =>
      client.getTreeDataTypeAncestors(params, FULL_RESPONSE_OPTIONS)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDataTypeAncestorsQueryParams.shape, typeof getTreeDataTypeAncestorsResponse>;

export default withStandardDecorators(GetDataTypeAncestorsTool);
