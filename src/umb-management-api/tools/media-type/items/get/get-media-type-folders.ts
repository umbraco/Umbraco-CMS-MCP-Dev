import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { GetItemMediaTypeFoldersParams } from "@/umb-management-api/schemas/index.js";
import { getItemMediaTypeFoldersQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetMediaTypeFoldersTool = CreateUmbracoReadTool(
  "get-media-type-folders",
  "Lists media type folders with pagination support",
  getItemMediaTypeFoldersQueryParams.shape,
  async (params: GetItemMediaTypeFoldersParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemMediaTypeFolders(params);

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

export default GetMediaTypeFoldersTool;