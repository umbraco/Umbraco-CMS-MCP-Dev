import {
  getItemMemberGroupQueryParams,
  getItemMemberGroupResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { GetItemMemberGroupParams } from "@/umb-management-api/schemas/index.js";

const GetMemberGroupByIdArrayTool = {
  name: "get-member-group-by-id-array",
  description: "Gets member groups by an array of IDs",
  inputSchema: getItemMemberGroupQueryParams.shape,
  outputSchema: getItemMemberGroupResponse,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetItemMemberGroupParams) => {
    return executeGetApiCall((client) =>
      client.getItemMemberGroup(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemMemberGroupQueryParams.shape, typeof getItemMemberGroupResponse>;

export default withStandardDecorators(GetMemberGroupByIdArrayTool);
