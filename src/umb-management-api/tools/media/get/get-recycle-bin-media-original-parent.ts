import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getRecycleBinMediaByIdOriginalParentParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetRecycleBinMediaOriginalParentTool = CreateUmbracoReadTool(
  "get-recycle-bin-media-original-parent",
  `Get the original parent location of a media item in the recycle bin
  Returns information about where the media item was located before deletion.`,
  getRecycleBinMediaByIdOriginalParentParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRecycleBinMediaByIdOriginalParent(id);
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

export default GetRecycleBinMediaOriginalParentTool;