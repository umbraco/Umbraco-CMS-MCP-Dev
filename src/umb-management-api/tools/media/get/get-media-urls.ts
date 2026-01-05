import { UmbracoManagementClient } from "@umb-management-client";
import { GetMediaUrlsParams } from "@/umb-management-api/schemas/index.js";
import { getMediaUrlsQueryParams, getMediaUrlsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

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
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaUrls(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getMediaUrlsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMediaUrlsTool);
