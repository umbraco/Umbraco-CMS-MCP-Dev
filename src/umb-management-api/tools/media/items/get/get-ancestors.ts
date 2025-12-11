import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getTreeMediaAncestorsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetMediaAncestorsTool = CreateUmbracoReadTool(
  "get-media-ancestors",
  "Gets ancestor items for a media.",
  getTreeMediaAncestorsQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeMediaAncestors(params);
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

export default GetMediaAncestorsTool;
