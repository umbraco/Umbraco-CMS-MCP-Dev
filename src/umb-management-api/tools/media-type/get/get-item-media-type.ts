import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getItemMediaTypeQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetItemMediaTypeTool = CreateUmbracoReadTool(
  "get-item-media-type",
  "Gets media type items by their ids",
  getItemMediaTypeQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemMediaType(params);

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

export default GetItemMediaTypeTool;
