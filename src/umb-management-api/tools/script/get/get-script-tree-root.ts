import { GetTreeScriptRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeScriptRootQueryParams, getTreeScriptRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetScriptTreeRootTool = {
  name: "get-script-tree-root",
  description: "Gets script tree root",
  inputSchema: getTreeScriptRootQueryParams.shape,
  outputSchema: getTreeScriptRootResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (model: GetTreeScriptRootParams) => {
    return executeGetApiCall((client) =>
      client.getTreeScriptRoot(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeScriptRootQueryParams.shape, typeof getTreeScriptRootResponse.shape>;

export default withStandardDecorators(GetScriptTreeRootTool);
