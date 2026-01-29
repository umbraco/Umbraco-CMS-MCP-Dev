import { GetTreeStylesheetSiblingsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeStylesheetSiblingsQueryParams, getTreeStylesheetSiblingsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetStylesheetSiblingsTool = {
  name: "get-stylesheet-siblings",
  description: "Gets sibling stylesheets for a given descendant path",
  inputSchema: getTreeStylesheetSiblingsQueryParams.shape,
  outputSchema: getTreeStylesheetSiblingsResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeStylesheetSiblingsParams) => {
    return executeGetApiCall((client) =>
      client.getTreeStylesheetSiblings(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeStylesheetSiblingsQueryParams.shape, typeof getTreeStylesheetSiblingsResponse.shape>;

export default withStandardDecorators(GetStylesheetSiblingsTool);
