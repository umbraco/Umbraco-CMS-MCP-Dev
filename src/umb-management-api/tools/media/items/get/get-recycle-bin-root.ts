import { GetRecycleBinMediaRootParams } from "@/umb-management-api/schemas/index.js";
import { getRecycleBinMediaRootQueryParams, getRecycleBinMediaRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetRecycleBinMediaRootTool = {
  name: "get-recycle-bin-media-root",
  description: "Gets root items for the media recycle bin.",
  inputSchema: getRecycleBinMediaRootQueryParams.shape,
  outputSchema: getRecycleBinMediaRootResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree', 'recycle-bin'],
  handler: (async (params: GetRecycleBinMediaRootParams) => {
    return executeGetApiCall((client) =>
      client.getRecycleBinMediaRoot(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getRecycleBinMediaRootQueryParams.shape, typeof getRecycleBinMediaRootResponse.shape>;

export default withStandardDecorators(GetRecycleBinMediaRootTool);
