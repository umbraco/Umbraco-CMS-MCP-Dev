import { getMemberByIdParams, getMemberByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetMemberTool = {
  name: "get-member",
  description: "Gets a member by Id",
  inputSchema: getMemberByIdParams.shape,
  outputSchema: getMemberByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getMemberById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getMemberByIdParams.shape, typeof getMemberByIdResponse.shape>;

export default withStandardDecorators(GetMemberTool);
