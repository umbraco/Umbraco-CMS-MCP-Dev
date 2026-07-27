import { GetTreeMediaSiblingsParams } from "@/umbraco-api/schemas/index.js";
import { getTreeMediaSiblingsQueryParams, getTreeMediaSiblingsResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetMediaSiblingsTool = {
  name: "get-media-siblings",
  description: "Gets sibling media items for a given descendant id",
  inputSchema: getTreeMediaSiblingsQueryParams.shape,
  outputSchema: getTreeMediaSiblingsResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeMediaSiblingsParams) => {
    return executeGetApiCall((client) =>
      client.getTreeMediaSiblings(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeMediaSiblingsQueryParams.shape, typeof getTreeMediaSiblingsResponse.shape>;

export default withStandardDecorators(GetMediaSiblingsTool);
