import { GetTreeMediaRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeMediaRootQueryParams, getTreeMediaRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetMediaRootTool = {
  name: "get-media-root",
  description: "Gets root items for media.",
  inputSchema: getTreeMediaRootQueryParams.shape,
  outputSchema: getTreeMediaRootResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeMediaRootParams) => {
    return executeGetApiCall((client) =>
      client.getTreeMediaRoot(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeMediaRootQueryParams.shape, typeof getTreeMediaRootResponse.shape>;

export default withStandardDecorators(GetMediaRootTool);
