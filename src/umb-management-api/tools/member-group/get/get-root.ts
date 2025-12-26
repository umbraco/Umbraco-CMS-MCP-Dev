import {
  getTreeMemberGroupRootQueryParams,
  getTreeMemberGroupRootResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { GetTreeMemberGroupRootParams } from "@/umb-management-api/schemas/index.js";

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
