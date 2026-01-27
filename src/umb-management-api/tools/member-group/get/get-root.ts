import {
  getTreeMemberGroupRootQueryParams,
  getTreeMemberGroupRootResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetTreeMemberGroupRootParams } from "@/umb-management-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetMemberGroupRootTool = {
  name: "get-member-group-root",
  description: "Gets the root level of the member group tree",
  inputSchema: getTreeMemberGroupRootQueryParams.shape,
  outputSchema: getTreeMemberGroupRootResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree'],
  handler: (async (params: GetTreeMemberGroupRootParams) => {
    return executeGetApiCall((client) =>
      client.getTreeMemberGroupRoot(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeMemberGroupRootQueryParams.shape, typeof getTreeMemberGroupRootResponse.shape>;

export default withStandardDecorators(GetMemberGroupRootTool);
