import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { getTreeMediaRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetMediaRootTool = CreateUmbracoTool(
  "get-media-root",
  "Gets root items for media.",
  getTreeMediaRootQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeMediaRoot(params);
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

export default GetMediaRootTool;
