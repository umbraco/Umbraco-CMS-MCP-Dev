import { GetRecycleBinMediaChildrenParams } from "@/umbraco-api/schemas/index.js";
import { getRecycleBinMediaChildrenQueryParams, getRecycleBinMediaChildrenResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetRecycleBinMediaChildrenTool = {
  name: "get-recycle-bin-media-children",
  description: "Gets child items for a media item in the recycle bin.",
  inputSchema: getRecycleBinMediaChildrenQueryParams.shape,
  outputSchema: getRecycleBinMediaChildrenResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree', 'recycle-bin'],
  handler: (async (params: GetRecycleBinMediaChildrenParams) => {
    return executeGetApiCall((client) =>
      client.getRecycleBinMediaChildren(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getRecycleBinMediaChildrenQueryParams.shape, typeof getRecycleBinMediaChildrenResponse.shape>;

export default withStandardDecorators(GetRecycleBinMediaChildrenTool);
