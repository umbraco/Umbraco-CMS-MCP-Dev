import {
  getMemberGroupByIdParams,
  getMemberGroupByIdResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetMemberGroupTool = {
  name: "get-member-group",
  description: "Gets a member group by Id",
  inputSchema: getMemberGroupByIdParams.shape,
  outputSchema: getMemberGroupByIdResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getMemberGroupById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getMemberGroupByIdParams.shape, typeof getMemberGroupByIdResponse.shape>;

export default withStandardDecorators(GetMemberGroupTool);
