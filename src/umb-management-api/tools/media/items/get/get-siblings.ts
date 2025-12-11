import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getTreeMediaSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetMediaSiblingsTool = CreateUmbracoReadTool(
  "get-media-siblings",
  "Gets sibling media items for a given descendant id",
  getTreeMediaSiblingsQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeMediaSiblings(params);
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

export default GetMediaSiblingsTool;
