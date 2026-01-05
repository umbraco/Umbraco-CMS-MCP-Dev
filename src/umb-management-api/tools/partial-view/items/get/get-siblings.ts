import { GetTreePartialViewSiblingsParams } from "@/umb-management-api/schemas/index.js";
import { getTreePartialViewSiblingsQueryParams, getTreePartialViewSiblingsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetPartialViewSiblingsTool = {
  name: "get-partial-view-siblings",
  description: "Gets sibling partial views for a given descendant path",
  inputSchema: getTreePartialViewSiblingsQueryParams.shape,
  outputSchema: getTreePartialViewSiblingsResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreePartialViewSiblingsParams) => {
    return executeGetApiCall((client) =>
      client.getTreePartialViewSiblings(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreePartialViewSiblingsQueryParams.shape, typeof getTreePartialViewSiblingsResponse.shape>;

export default withStandardDecorators(GetPartialViewSiblingsTool);
