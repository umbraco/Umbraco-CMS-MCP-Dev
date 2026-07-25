import { GetTreeDataTypeSiblingsParams } from "@/umbraco-api/schemas/index.js";
import { getTreeDataTypeSiblingsQueryParams, getTreeDataTypeSiblingsResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
    return executeGetApiCall((client) =>
      client.getTreeDataTypeSiblings(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDataTypeSiblingsQueryParams.shape, typeof getTreeDataTypeSiblingsResponse.shape>;

export default withStandardDecorators(GetDataTypeSiblingsTool);
