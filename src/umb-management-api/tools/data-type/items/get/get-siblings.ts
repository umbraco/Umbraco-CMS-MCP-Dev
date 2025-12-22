import { GetTreeDataTypeSiblingsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDataTypeSiblingsQueryParams, getTreeDataTypeSiblingsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetOperation, FULL_RESPONSE_OPTIONS } from "@/helpers/mcp/tool-decorators.js";

const GetDataTypeSiblingsTool = {
  name: "get-data-type-siblings",
  description: "Gets sibling data types or data type folders for a given descendant id",
  inputSchema: getTreeDataTypeSiblingsQueryParams.shape,
  outputSchema: getTreeDataTypeSiblingsResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree'],
  handler: (async (params: GetTreeDataTypeSiblingsParams) => {
    return executeGetOperation((client) =>
      client.getTreeDataTypeSiblings(params, FULL_RESPONSE_OPTIONS)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDataTypeSiblingsQueryParams.shape, typeof getTreeDataTypeSiblingsResponse.shape>;

export default withStandardDecorators(GetDataTypeSiblingsTool);
