import { UmbracoManagementClient } from "@umb-management-client";
import { getImagingResizeUrlsQueryParams, getImagingResizeUrlsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetImagingResizeUrlsParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

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
    const client = UmbracoManagementClient.getClient();
    const response = await client.getImagingResizeUrls(model);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getImagingResizeUrlsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetImagingResizeUrlsTool);
