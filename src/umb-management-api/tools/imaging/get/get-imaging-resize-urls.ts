import { getImagingResizeUrlsQueryParams, getImagingResizeUrlsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetImagingResizeUrlsParams } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Wrap array response in object (MCP requirement)
const outputSchema = z.object({
  items: getImagingResizeUrlsResponse,
});

const GetImagingResizeUrlsTool = {
  name: "get-imaging-resize-urls",
  description: `Generates resized image URLs for media items.
  Takes media item IDs and resize parameters to generate optimized image URLs.
  Returns an object containing:
  - Array of media items with their resize URL information
  - Each item includes the media ID and URL info with culture and resized URLs

  Parameters:
  - id: Array of media item UUIDs
  - height: Target height in pixels (default: 200)
  - width: Target width in pixels (default: 200)
  - mode: Resize mode (Crop, Max, Stretch, Pad, BoxPad, Min)`,
  inputSchema: getImagingResizeUrlsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  handler: (async (model: GetImagingResizeUrlsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getImagingResizeUrls(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getImagingResizeUrlsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetImagingResizeUrlsTool);
