import { getMemberAreReferencedQueryParams, getMemberAreReferencedResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetMemberAreReferencedParams } from "@/umb-management-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetMemberAreReferencedTool = {
  name: "get-member-are-referenced",
  description: `Check if member accounts are referenced
  Use this to verify if specific member accounts are being referenced by content.`,
  inputSchema: getMemberAreReferencedQueryParams.shape,
  outputSchema: getMemberAreReferencedResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['references'],
  handler: (async (params: GetMemberAreReferencedParams) => {
    return executeGetApiCall((client) =>
      client.getMemberAreReferenced(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getMemberAreReferencedQueryParams.shape, typeof getMemberAreReferencedResponse.shape>;

export default withStandardDecorators(GetMemberAreReferencedTool);
