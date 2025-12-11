import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getUserCurrentPermissionsMediaQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetUserCurrentPermissionsMediaTool = CreateUmbracoReadTool(
  "get-user-current-permissions-media",
  "Gets the current user's media permissions for specific media items",
  getUserCurrentPermissionsMediaQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserCurrentPermissionsMedia(params);

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

export default GetUserCurrentPermissionsMediaTool;