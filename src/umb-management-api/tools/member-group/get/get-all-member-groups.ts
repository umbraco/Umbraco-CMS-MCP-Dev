import { GetMemberGroupParams } from "@/umb-management-api/schemas/index.js";
import {
  getMemberGroupQueryParams,
  getMemberGroupResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetAllMemberGroupsTool = {
  name: "get-all-member-groups",
  description: "Gets all member groups with optional pagination",
  inputSchema: getMemberGroupQueryParams.shape,
  outputSchema: getMemberGroupResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetMemberGroupParams) => {
    return executeGetApiCall((client) =>
      client.getMemberGroup(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getMemberGroupQueryParams.shape, typeof getMemberGroupResponse.shape>;

export default withStandardDecorators(GetAllMemberGroupsTool);
