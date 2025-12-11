import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getTreeStaticFileRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetStaticFileRootTool = CreateUmbracoReadTool(
  "get-static-file-root",
  "Gets root-level static files and folders in the Umbraco file system",
  getTreeStaticFileRootQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeStaticFileRoot(params);
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

export default GetStaticFileRootTool;