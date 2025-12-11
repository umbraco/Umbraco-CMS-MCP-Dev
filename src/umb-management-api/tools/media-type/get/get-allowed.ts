import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getItemMediaTypeAllowedQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetAllowedMediaTypeTool = CreateUmbracoReadTool(
  "get-allowed-media-type",
  "Gets allowed file extensions for media types",
  getItemMediaTypeAllowedQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemMediaTypeAllowed(params);

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

export default GetAllowedMediaTypeTool;
