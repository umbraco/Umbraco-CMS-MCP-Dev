import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getRecycleBinMediaSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetMediaRecycleBinSiblingsTool = CreateUmbracoTool(
  "get-media-recycle-bin-siblings",
  "Gets sibling media items in the recycle bin for a given descendant id",
  getRecycleBinMediaSiblingsQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRecycleBinMediaSiblings(params);
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

export default GetMediaRecycleBinSiblingsTool;
