import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import {
  getItemMediaQueryParams,
  getItemMediaResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetMediaByIdArrayTool = CreateUmbracoReadTool(
  "get-media-by-id-array",
  "Gets media items by an array of IDs",
  getItemMediaQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemMedia(params);
    // Validate response shape
    getItemMediaResponse.parse(response);
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

export default GetMediaByIdArrayTool;
