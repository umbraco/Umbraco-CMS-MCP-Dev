import { UmbracoManagementClient } from "@umb-management-client";
import { getMediaTypeAllowedAtRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetMediaTypeAllowedAtRootParams } from "@/umb-management-api/schemas/index.js";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";

const GetMediaTypeAllowedAtRootTool = CreateUmbracoReadTool(
  "get-media-type-allowed-at-root",
  "Get media types that are allowed at root level",
  getMediaTypeAllowedAtRootQueryParams.shape,
  async (model: GetMediaTypeAllowedAtRootParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaTypeAllowedAtRoot(model);

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

export default GetMediaTypeAllowedAtRootTool;
