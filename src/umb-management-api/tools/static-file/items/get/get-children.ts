import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getTreeStaticFileChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetStaticFileChildrenTool = CreateUmbracoTool(
  "get-static-file-children",
  "Lists child files and folders in a static file directory by parent path",
  getTreeStaticFileChildrenQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeStaticFileChildren(params);
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

export default GetStaticFileChildrenTool;