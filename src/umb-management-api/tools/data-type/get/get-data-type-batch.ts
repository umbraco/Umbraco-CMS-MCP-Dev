import { GetDataTypeBatchParams } from "@/umb-management-api/schemas/index.js";
import { getDataTypeBatchQueryParams, getDataTypeBatchResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDataTypeBatchTool = {
  name: "get-data-type-batch",
  description: `Gets full data types for multiple Ids in one call.
  Returns each data type's editor configuration values (e.g. dropdown options, numeric min/max),
  not just the lightweight item shape returned by get-data-types-by-id-array.
  Use when you need the same payload as get-data-type but for many Ids at once.`,
  inputSchema: getDataTypeBatchQueryParams.shape,
  outputSchema: getDataTypeBatchResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetDataTypeBatchParams) => {
    return executeGetApiCall((client) =>
      client.getDataTypeBatch(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDataTypeBatchQueryParams.shape, typeof getDataTypeBatchResponse.shape>;

export default withStandardDecorators(GetDataTypeBatchTool);
