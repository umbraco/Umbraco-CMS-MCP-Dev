import { GetFilterMemberParams } from "@/umbraco-api/schemas/index.js";
import { getFilterMemberQueryParams, getFilterMemberResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
