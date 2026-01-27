import { GetTreeStylesheetRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeStylesheetRootQueryParams, getTreeStylesheetRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetStylesheetRootTool = {
  name: "get-stylesheet-root",
  description: "Gets the root stylesheets in the tree structure",
  inputSchema: getTreeStylesheetRootQueryParams.shape,
  outputSchema: getTreeStylesheetRootResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (model: GetTreeStylesheetRootParams) => {
    return executeGetApiCall((client) =>
      client.getTreeStylesheetRoot(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeStylesheetRootQueryParams.shape, typeof getTreeStylesheetRootResponse.shape>;

export default withStandardDecorators(GetStylesheetRootTool);
