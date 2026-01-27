import { GetTreeMediaTypeChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreeMediaTypeChildrenQueryParams, getTreeMediaTypeChildrenResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetMediaTypeChildrenTool = {
  name: "get-media-type-children",
  description: "Gets the children of a media type",
  inputSchema: getTreeMediaTypeChildrenQueryParams.shape,
  outputSchema: getTreeMediaTypeChildrenResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeMediaTypeChildrenParams) => {
    return executeGetApiCall((client) =>
      client.getTreeMediaTypeChildren(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeMediaTypeChildrenQueryParams.shape, typeof getTreeMediaTypeChildrenResponse.shape>;

export default withStandardDecorators(GetMediaTypeChildrenTool);
