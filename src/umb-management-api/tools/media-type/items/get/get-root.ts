import { GetTreeMediaTypeRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeMediaTypeRootQueryParams, getTreeMediaTypeRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetMediaTypeRootTool = {
  name: "get-media-type-root",
  description: "Gets the root level of the media type tree",
  inputSchema: getTreeMediaTypeRootQueryParams.shape,
  outputSchema: getTreeMediaTypeRootResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeMediaTypeRootParams) => {
    return executeGetApiCall((client) =>
      client.getTreeMediaTypeRoot(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeMediaTypeRootQueryParams.shape, typeof getTreeMediaTypeRootResponse.shape>;

export default withStandardDecorators(GetMediaTypeRootTool);
