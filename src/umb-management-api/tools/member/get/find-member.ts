import { GetFilterMemberParams } from "@/umb-management-api/schemas/index.js";
import { getFilterMemberQueryParams, getFilterMemberResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const FindMemberTool = {
  name: "find-member",
  description: `Finds members by various filter criteria`,
  inputSchema: getFilterMemberQueryParams.shape,
  outputSchema: getFilterMemberResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['search'],
  handler: (async (model: GetFilterMemberParams) => {
    return executeGetApiCall((client) =>
      client.getFilterMember(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getFilterMemberQueryParams.shape, typeof getFilterMemberResponse.shape>;

export default withStandardDecorators(FindMemberTool);
