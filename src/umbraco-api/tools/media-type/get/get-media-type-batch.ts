import { GetMediaTypeBatchParams } from "@/umbraco-api/schemas/index.js";
import { getMediaTypeBatchQueryParams, getMediaTypeBatchResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetMediaTypeBatchTool = {
  name: "get-media-type-batch",
  description: `Gets full media types for multiple Ids in one call.
  Returns each media type's properties, allowedMediaTypes and compositions,
  not just the lightweight item shape returned by get-media-type-by-ids.
  Use when you need the same payload as get-media-type-by-id but for many Ids at once.`,
  inputSchema: getMediaTypeBatchQueryParams.shape,
  outputSchema: getMediaTypeBatchResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetMediaTypeBatchParams) => {
    return executeGetApiCall((client) =>
      client.getMediaTypeBatch(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getMediaTypeBatchQueryParams.shape, typeof getMediaTypeBatchResponse.shape>;

export default withStandardDecorators(GetMediaTypeBatchTool);
