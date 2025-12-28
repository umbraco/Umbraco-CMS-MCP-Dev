import { UmbracoManagementClient } from "@umb-management-client";
import { getImagingResizeUrlsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetImagingResizeUrlsParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

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
  schema: getImagingResizeUrlsQueryParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async (model: GetImagingResizeUrlsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getImagingResizeUrls(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getImagingResizeUrlsQueryParams.shape>;

export default withStandardDecorators(GetImagingResizeUrlsTool);