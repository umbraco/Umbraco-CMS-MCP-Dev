import { GetTreeMemberTypeRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeMemberTypeRootQueryParams, getTreeMemberTypeRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetMemberTypeRootTool = {
  name: "get-member-type-root",
  description: "Gets the root level of the member type tree",
  inputSchema: getTreeMemberTypeRootQueryParams.shape,
  outputSchema: getTreeMemberTypeRootResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeMemberTypeRootParams) => {
    return executeGetApiCall((client) =>
      client.getTreeMemberTypeRoot(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeMemberTypeRootQueryParams.shape, typeof getTreeMemberTypeRootResponse.shape>;

export default withStandardDecorators(GetMemberTypeRootTool);
