import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getMediaUrlsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetMediaUrlsTool = CreateUmbracoReadTool(
  "get-media-urls",
  "Gets the URLs for a media item.",
  getMediaUrlsQueryParams.shape,
  async (params) => {
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
  }
);

export default GetMediaUrlsTool;
