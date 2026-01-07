import { GetMediaUrlsParams } from "@/umb-management-api/schemas/index.js";
import { getMediaUrlsQueryParams, getMediaUrlsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

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
