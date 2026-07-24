import { GetUserBatchParams } from "@/umbraco-api/schemas/index.js";
import { getUserBatchQueryParams, getUserBatchResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetUserBatchTool = {
  name: "get-user-batch",
  description: "Gets multiple users identified by the provided Ids in one call.",
  inputSchema: getUserBatchQueryParams.shape,
  outputSchema: getUserBatchResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async (params: GetUserBatchParams) => {
    return executeGetApiCall((client) =>
      client.getUserBatch(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getUserBatchQueryParams.shape, typeof getUserBatchResponse.shape>;

export default withStandardDecorators(GetUserBatchTool);
