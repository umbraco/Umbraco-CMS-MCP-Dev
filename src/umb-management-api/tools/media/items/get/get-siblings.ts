import { GetTreeMediaSiblingsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeMediaSiblingsQueryParams, getTreeMediaSiblingsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
