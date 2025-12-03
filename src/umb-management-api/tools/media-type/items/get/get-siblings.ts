import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getTreeMediaTypeSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetMediaTypeSiblingsTool = CreateUmbracoTool(
  "get-media-type-siblings",
  "Gets sibling media types or media type folders for a given descendant id",
  getTreeMediaTypeSiblingsQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeMediaTypeSiblings(params);

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

export default GetMediaTypeSiblingsTool;
