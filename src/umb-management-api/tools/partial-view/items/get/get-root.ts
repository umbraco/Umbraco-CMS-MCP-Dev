import { GetTreePartialViewRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreePartialViewRootQueryParams, getTreePartialViewRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetPartialViewRootTool = {
  name: "get-partial-view-root",
  description: "Gets the root partial views in the tree structure",
  inputSchema: getTreePartialViewRootQueryParams.shape,
  outputSchema: getTreePartialViewRootResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (model: GetTreePartialViewRootParams) => {
    return executeGetApiCall((client) =>
      client.getTreePartialViewRoot(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreePartialViewRootQueryParams.shape, typeof getTreePartialViewRootResponse.shape>;

export default withStandardDecorators(GetPartialViewRootTool);