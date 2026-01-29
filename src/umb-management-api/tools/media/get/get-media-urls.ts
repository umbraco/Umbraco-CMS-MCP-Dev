import { GetMediaUrlsParams } from "@/umb-management-api/schemas/index.js";
import { getMediaUrlsQueryParams, getMediaUrlsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getMediaUrlsResponse,
});

const GetMediaUrlsTool = {
  name: "get-media-urls",
  description: "Gets the URLs for a media item.",
  inputSchema: getMediaUrlsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async (params: GetMediaUrlsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getMediaUrls(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getMediaUrlsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMediaUrlsTool);
