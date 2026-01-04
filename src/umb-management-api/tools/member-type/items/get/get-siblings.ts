import { getTreeMemberTypeSiblingsQueryParams, getTreeMemberTypeSiblingsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetTreeMemberTypeSiblingsParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetMemberTypeSiblingsTool = {
  name: "get-member-type-siblings",
  description: "Gets sibling member types or member type folders for a given descendant id",
  inputSchema: getTreeMemberTypeSiblingsQueryParams.shape,
  outputSchema: getTreeMemberTypeSiblingsResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeMemberTypeSiblingsParams) => {
    return executeGetApiCall((client) =>
      client.getTreeMemberTypeSiblings(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeMemberTypeSiblingsQueryParams.shape, typeof getTreeMemberTypeSiblingsResponse.shape>;

export default withStandardDecorators(GetMemberTypeSiblingsTool);
