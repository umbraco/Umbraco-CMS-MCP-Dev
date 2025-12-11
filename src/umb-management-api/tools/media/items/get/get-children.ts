import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getTreeMediaChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetMediaChildrenTool = CreateUmbracoReadTool(
  "get-media-children",
  "Gets child items for a media.",
  getTreeMediaChildrenQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeMediaChildren(params);
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

export default GetMediaChildrenTool;
