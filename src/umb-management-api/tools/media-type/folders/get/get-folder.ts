import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getMediaTypeFolderByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetMediaTypeFolderTool = CreateUmbracoReadTool(
  "get-media-type-folder",
  "Gets a media type folder by Id",
  getMediaTypeFolderByIdParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaTypeFolderById(id);

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

export default GetMediaTypeFolderTool;
