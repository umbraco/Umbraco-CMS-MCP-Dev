import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getItemStaticFileQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetStaticFilesTool = CreateUmbracoReadTool(
  "get-static-files",
  "Lists static files with optional path filtering for browsing the file system",
  getItemStaticFileQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemStaticFile(params);
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

export default GetStaticFilesTool;