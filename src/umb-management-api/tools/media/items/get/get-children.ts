import { GetTreeMediaChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreeMediaChildrenQueryParams, getTreeMediaChildrenResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetMediaChildrenTool = {
  name: "get-media-children",
  description: "Gets child items for a media.",
  inputSchema: getTreeMediaChildrenQueryParams.shape,
  outputSchema: getTreeMediaChildrenResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeMediaChildrenParams) => {
    return executeGetApiCall((client) =>
      client.getTreeMediaChildren(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeMediaChildrenQueryParams.shape, typeof getTreeMediaChildrenResponse.shape>;

export default withStandardDecorators(GetMediaChildrenTool);
