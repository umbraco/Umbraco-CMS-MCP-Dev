import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getTreeStaticFileAncestorsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetStaticFileAncestorsTool = CreateUmbracoReadTool(
  "get-static-file-ancestors",
  "Gets ancestor folders for navigation breadcrumbs by descendant path",
  getTreeStaticFileAncestorsQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeStaticFileAncestors(params);
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

export default GetStaticFileAncestorsTool;