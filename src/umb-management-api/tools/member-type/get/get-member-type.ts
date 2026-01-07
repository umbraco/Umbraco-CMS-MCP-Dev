import { getMemberTypeByIdParams, getMemberTypeByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetMemberTypeTool = {
  name: "get-member-type",
  description: "Gets a member type by Id",
  inputSchema: getMemberTypeByIdParams.shape,
  outputSchema: getMemberTypeByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getMemberTypeById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getMemberTypeByIdParams.shape, typeof getMemberTypeByIdResponse.shape>;

export default withStandardDecorators(GetMemberTypeTool);
