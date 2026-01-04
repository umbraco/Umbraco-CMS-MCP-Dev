import { getTreeMediaTypeSiblingsQueryParams, getTreeMediaTypeSiblingsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetTreeMediaTypeSiblingsParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetMediaTypeSiblingsTool = {
  name: "get-media-type-siblings",
  description: "Gets sibling media types or media type folders for a given descendant id",
  inputSchema: getTreeMediaTypeSiblingsQueryParams.shape,
  outputSchema: getTreeMediaTypeSiblingsResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeMediaTypeSiblingsParams) => {
    return executeGetApiCall((client) =>
      client.getTreeMediaTypeSiblings(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeMediaTypeSiblingsQueryParams.shape, typeof getTreeMediaTypeSiblingsResponse.shape>;

export default withStandardDecorators(GetMediaTypeSiblingsTool);
