import { GetMemberTypeBatchParams } from "@/umbraco-api/schemas/index.js";
import { getMemberTypeBatchQueryParams, getMemberTypeBatchResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetMemberTypeBatchTool = {
  name: "get-member-type-batch",
  description: `Gets full member types for multiple Ids in one call.
  Returns each member type's properties and compositions including the per-property
  memberCanEdit / memberCanView / isSensitive flags, not just the lightweight item shape
  returned by get-member-types-by-id-array. Use when you need the same payload as
  get-member-type-by-id but for many Ids at once.`,
  inputSchema: getMemberTypeBatchQueryParams.shape,
  outputSchema: getMemberTypeBatchResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetMemberTypeBatchParams) => {
    return executeGetApiCall((client) =>
      client.getMemberTypeBatch(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getMemberTypeBatchQueryParams.shape, typeof getMemberTypeBatchResponse.shape>;

export default withStandardDecorators(GetMemberTypeBatchTool);
