import { GetRecycleBinMediaSiblingsParams } from "@/umb-management-api/schemas/index.js";
import { getRecycleBinMediaSiblingsQueryParams, getRecycleBinMediaSiblingsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetMediaRecycleBinSiblingsTool = {
  name: "get-media-recycle-bin-siblings",
  description: "Gets sibling media items in the recycle bin for a given descendant id",
  inputSchema: getRecycleBinMediaSiblingsQueryParams.shape,
  outputSchema: getRecycleBinMediaSiblingsResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree', 'recycle-bin'],
  handler: (async (params: GetRecycleBinMediaSiblingsParams) => {
    return executeGetApiCall((client) =>
      client.getRecycleBinMediaSiblings(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getRecycleBinMediaSiblingsQueryParams.shape, typeof getRecycleBinMediaSiblingsResponse.shape>;

export default withStandardDecorators(GetMediaRecycleBinSiblingsTool);
