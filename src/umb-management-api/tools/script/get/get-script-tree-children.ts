import { GetTreeScriptChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreeScriptChildrenQueryParams, getTreeScriptChildrenResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetScriptTreeChildrenTool = {
  name: "get-script-tree-children",
  description: "Gets script tree children",
  inputSchema: getTreeScriptChildrenQueryParams.shape,
  outputSchema: getTreeScriptChildrenResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (model: GetTreeScriptChildrenParams) => {
    return executeGetApiCall((client) =>
      client.getTreeScriptChildren(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeScriptChildrenQueryParams.shape, typeof getTreeScriptChildrenResponse.shape>;

export default withStandardDecorators(GetScriptTreeChildrenTool);
