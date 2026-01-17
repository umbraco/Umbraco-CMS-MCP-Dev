import { GetTreeScriptSiblingsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeScriptSiblingsQueryParams, getTreeScriptSiblingsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetScriptTreeSiblingsTool = {
  name: "get-script-tree-siblings",
  description: "Gets sibling scripts for a given descendant path",
  inputSchema: getTreeScriptSiblingsQueryParams.shape,
  outputSchema: getTreeScriptSiblingsResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (model: GetTreeScriptSiblingsParams) => {
    return executeGetApiCall((client) =>
      client.getTreeScriptSiblings(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeScriptSiblingsQueryParams.shape, typeof getTreeScriptSiblingsResponse.shape>;

export default withStandardDecorators(GetScriptTreeSiblingsTool);
