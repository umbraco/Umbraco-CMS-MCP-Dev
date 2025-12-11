import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getRecycleBinMediaRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetRecycleBinMediaRootTool = CreateUmbracoReadTool(
  "get-recycle-bin-media-root",
  "Gets root items for the media recycle bin.",
  getRecycleBinMediaRootQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRecycleBinMediaRoot(params);
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

export default GetRecycleBinMediaRootTool;
