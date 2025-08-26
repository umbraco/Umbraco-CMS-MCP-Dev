import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { GetTreeMediaTypeChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreeMediaTypeChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetMediaTypeChildrenTool = CreateUmbracoTool(
  "get-media-type-children",
  "Gets the children of a media type",
  getTreeMediaTypeChildrenQueryParams.shape,
  async (params: GetTreeMediaTypeChildrenParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeMediaTypeChildren(params);

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

export default GetMediaTypeChildrenTool;
