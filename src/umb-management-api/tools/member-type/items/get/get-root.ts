import { GetTreeMemberTypeRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeMemberTypeRootQueryParams, getTreeMemberTypeRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
