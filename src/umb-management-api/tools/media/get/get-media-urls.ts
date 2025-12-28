import { UmbracoManagementClient } from "@umb-management-client";
import { getMediaUrlsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type GetMediaUrlsParams = z.infer<typeof getMediaUrlsQueryParams>;

const GetMediaUrlsTool = {
  name: "get-media-urls",
  description: "Gets the URLs for a media item.",
  schema: getMediaUrlsQueryParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async (params: GetMediaUrlsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaUrls(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getMediaUrlsQueryParams.shape>;

export default withStandardDecorators(GetMediaUrlsTool);
